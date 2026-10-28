const http = require("http");
const { WebSocketServer } = require("ws");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

// Simple HTTP server to serve static files in production
const server = http.createServer((req, res) => {
  // Health check for Render/Railway
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
    return;
  }

  // API routes for profile save/load
  if (req.url?.startsWith("/api/profile")) {
    handleProfile(req, res);
    return;
  }

  // Serve static frontend files
  const publicPath = path.join(__dirname, "..", "dist");
  let filePath = path.join(publicPath, req.url === "/" ? "index.html" : req.url);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(publicPath, "index.html");
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
  };

  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
  fs.createReadStream(filePath).pipe(res);
});

// ===== WebSocket Relay =====
const wss = new WebSocketServer({ server });

// Room: { roomId: Set<WebSocket> }
const rooms = new Map();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = url.searchParams.get("room");

  if (!roomId) {
    ws.close(4000, "Missing room parameter");
    return;
  }

  // Join room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
  console.log(`Client joined room ${roomId} (${rooms.get(roomId).size} clients)`);

  ws.on("message", (rawData) => {
    try {
      const message = JSON.parse(rawData.toString());

      // Handle PING keepalive — respond directly to sender
      if (message.type === "PING") {
        ws.send(JSON.stringify({ type: "PONG" }));
        return;
      }

      const { channel, message: payload } = message;

      // Relay to ALL OTHER clients in the same room
      const clients = rooms.get(roomId);
      if (clients) {
        clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify({ room: roomId, channel, message: payload }));
          }
        });
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  });

  ws.on("close", () => {
    const clients = rooms.get(roomId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        rooms.delete(roomId);
      }
      console.log(`Client left room ${roomId} (${clients.size} remaining)`);
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
});

// ===== Profile API (saves to local JSON file) =====
const PROFILES_FILE = path.join(__dirname, "profiles.json");

function loadProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILES_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error loading profiles:", e);
  }
  return {};
}

function saveProfiles(data) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));
}

function handleProfile(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    const username = new URL(req.url, `http://${req.headers.host}`).searchParams.get("username");
    const profiles = loadProfiles();
    const profile = profiles[username];
    if (profile) {
      res.writeHead(200);
      res.end(JSON.stringify(profile));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Profile not found" }));
    }
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const { username, profile, oldUsername } = JSON.parse(body);
      const profiles = loadProfiles();
      if (oldUsername && oldUsername !== username) {
        delete profiles[oldUsername];
      }
      profiles[username] = profile;
      saveProfiles(profiles);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    });
  } else {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket relay ready at ws://localhost:${PORT}/sync-socket`);
});
