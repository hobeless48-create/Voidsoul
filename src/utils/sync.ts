/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SyncBridge {
  private ws: WebSocket | null = null;
  private localChannels: Map<string, BroadcastChannel> = new Map();
  private roomId: string = "";
  private onMessageCallbacks: Map<string, (msg: any) => void> = new Map();
  private isConnecting: boolean = false;
  private pingInterval: number | null = null;
  private pongTimeout: number | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 10;
  // Store active channel/callback so reconnects always use current values, not stale closures
  private activeChannelName: string = "";
  private activeOnMessage: ((msg: any) => void) | null = null;

  constructor() {}

  init(roomId: string, channelName: string, onMessage: (msg: any) => void) {
    this.roomId = roomId;
    this.activeChannelName = channelName;
    this.activeOnMessage = onMessage;
    this.onMessageCallbacks.set(channelName, onMessage);

    // 1. Setup local BroadcastChannel for tab-to-tab
    if (!this.localChannels.has(channelName)) {
      const bc = new BroadcastChannel(channelName);
      bc.onmessage = (event) => {
        onMessage(event.data);
      };
      this.localChannels.set(channelName, bc);
    }

    // 2. Setup WebSocket connection (if in multiplayer mode)
    if (roomId && roomId !== "LOCAL" && !this.isConnecting) {
      // Use VITE_WS_URL env var if set (for GitHub Pages + separate server),
      // otherwise default to same-host (works with Render/Railway single deploy or Hamachi)
      let wsBaseUrl = '';
      try {
        // @ts-ignore - Vite replaces import.meta.env at build time
        wsBaseUrl = import.meta.env.VITE_WS_URL;
      } catch (_) {}
      const baseUrl = wsBaseUrl || `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
      const wsUrl = `${baseUrl}/sync-socket?room=${roomId}`;
      
      if (this.ws) {
        if (this.ws.url === wsUrl && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
          return;
        }
        this.clearKeepAlive();
        this.ws.close();
        this.ws = null;
      }
      
      this.isConnecting = true;
      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log("WebSocket Sync Connection Established");
        this.setupKeepAlive();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "PONG") {
            this.handlePong();
            return;
          }
          if (data.room === this.roomId) {
            const callback = this.onMessageCallbacks.get(data.channel);
            if (callback) {
              callback(data.message);
            }
          }
        } catch (e) {
          console.error("Failed to parse socket message", e);
        }
      };

      socket.onerror = () => {
        this.isConnecting = false;
      };

      socket.onclose = () => {
        this.isConnecting = false;
        this.clearKeepAlive();
        this.ws = null;
        this.reconnectAttempts++;
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
          console.error(`Sync socket closed after ${this.maxReconnectAttempts} retry attempts. Giving up.`);
          return;
        }
        const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
        console.log(`Sync socket closed. Retrying in ${delay / 1000}s... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => {
          // Always reconnect using current stored values, not the stale closure
          if (this.activeChannelName && this.activeOnMessage) {
            this.init(this.roomId, this.activeChannelName, this.activeOnMessage);
          }
        }, delay);
      };
    }
  }

  send(channelName: string, message: any) {
    // Send locally
    const bc = this.localChannels.get(channelName);
    if (bc) {
      bc.postMessage(message);
    }

    // Send over socket
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.roomId && this.roomId !== "LOCAL") {
      this.ws.send(JSON.stringify({ room: this.roomId, channel: channelName, message }));
    }
  }

  private setupKeepAlive() {
    this.clearKeepAlive();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "PING", room: this.roomId }));
        this.pongTimeout = window.setTimeout(() => {
          if (this.ws) {
            console.warn("WebSocket ping timeout, closing connection...");
            this.ws.close();
          }
        }, 5000);
      }
    }, 15000);
  }

  private handlePong() {
    if (this.pongTimeout !== null) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private clearKeepAlive() {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout !== null) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  // Helper to load/save profile on host computer
  async loadProfile(username: string): Promise<any> {
    try {
      const res = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    }
    return null;
  }

  async saveProfile(username: string, profileData: any, oldUsername?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, profile: profileData, oldUsername }),
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to save profile", e);
    }
    return false;
  }

  close() {
    this.roomId = "";
    this.clearKeepAlive();
    if (this.ws) {
      this.ws.onclose = null; // Prevent retry loop on explicit close
      this.ws.close();
      this.ws = null;
    }
    this.localChannels.forEach(bc => bc.close());
    this.localChannels.clear();
    this.onMessageCallbacks.clear();
  }
}

export const syncBridge = new SyncBridge();
