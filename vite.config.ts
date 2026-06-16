import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import { WebSocketServer } from 'ws';

export default defineConfig(() => {
  return {
    // For GitHub Pages subpath deployment, set VITE_BASE_URL=/repo-name/
    // Defaults to / for Render/single-domain deploy
    base: process.env.VITE_BASE_URL || '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'websocket-sync-server',
        configureServer(server) {
          if (!server.httpServer) return;
          
          const wss = new WebSocketServer({ noServer: true });

          server.httpServer.on('upgrade', (request, socket, head) => {
            if (request.url?.startsWith('/sync-socket')) {
              wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
              });
            }
          });

          wss.on('connection', (ws) => {
            ws.on('message', (messageStr) => {
              const message = messageStr.toString();
              // Broadcast to all other clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) {
                  client.send(message);
                }
              });
            });
          });

          // HTTP middleware for profile save/load
          server.middlewares.use((req, res, next) => {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            if (url.pathname === '/api/profile') {
              if (req.method === 'GET') {
                const username = url.searchParams.get('username') || '';
                if (!username) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Missing username' }));
                  return;
                }
                const filename = `${username.replace(/[^a-zA-Z0-9_-]/g, '')}.json`;
                const savesDir = path.join(__dirname, 'saves');
                const filepath = path.join(savesDir, filename);

                if (fs.existsSync(filepath)) {
                  const data = fs.readFileSync(filepath, 'utf-8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(data);
                } else {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Profile not found' }));
                }
                return;
              } else if (req.method === 'POST') {
                let body = '';
                req.on('data', (chunk) => { body += chunk; });
                req.on('end', () => {
                  try {
                    const data = JSON.parse(body);
                    const username = data.username || '';
                    const oldUsername = data.oldUsername || '';
                    const profile = data.profile;
                    if (!username || !profile) {
                      res.statusCode = 400;
                      res.end(JSON.stringify({ error: 'Missing username or profile' }));
                      return;
                    }
                    const savesDir = path.join(__dirname, 'saves');
                    if (!fs.existsSync(savesDir)) {
                      fs.mkdirSync(savesDir);
                    }
                    // Delete old profile file if renaming
                    if (oldUsername && oldUsername !== username) {
                      const oldFilename = `${oldUsername.replace(/[^a-zA-Z0-9_-]/g, '')}.json`;
                      const oldFilepath = path.join(savesDir, oldFilename);
                      if (fs.existsSync(oldFilepath)) {
                        fs.unlinkSync(oldFilepath);
                      }
                    }
                    const filepath = path.join(savesDir, `${username.replace(/[^a-zA-Z0-9_-]/g, '')}.json`);
                    fs.writeFileSync(filepath, JSON.stringify(profile, null, 2), 'utf-8');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                  } catch (e) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Failed to write file' }));
                  }
                });
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/saves/**']
      },
    },
  };
});
