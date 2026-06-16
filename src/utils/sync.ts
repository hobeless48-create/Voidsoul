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

  constructor() {}

  init(roomId: string, channelName: string, onMessage: (msg: any) => void) {
    this.roomId = roomId;
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
        this.ws.close();
        this.ws = null;
      }
      
      this.isConnecting = true;
      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        this.isConnecting = false;
        console.log("WebSocket Sync Connection Established");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
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
        this.ws = null;
        console.log("Sync socket closed. Retrying in 3s...");
        setTimeout(() => {
          if (this.roomId === roomId) {
            this.init(roomId, channelName, onMessage);
          }
        }, 3000);
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.localChannels.forEach(bc => bc.close());
    this.localChannels.clear();
    this.onMessageCallbacks.clear();
  }
}

export const syncBridge = new SyncBridge();
