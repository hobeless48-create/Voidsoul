# Void Soul

Void Soul is a browser RPG with turn based encounters, character progression, profiles, and optional multiplayer through a WebSocket relay.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)
- A modern browser

## Run locally

From this folder, install dependencies and start the development server:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:3000`). The Vite development server provides the app and its WebSocket sync endpoint.

To create and serve a production build locally:

```powershell
npm run build
npm start
```

The production server listens on port `3000`, or the port supplied in the `PORT` environment variable. `npm run preview` serves the built frontend without the production WebSocket relay.

## Profiles and multiplayer

Profiles are stored as JSON files under `saves/` by the local server. Multiplayer sync uses the WebSocket server; deploy the app and server together on a host that supports persistent Node.js processes and WebSockets. The included `render.yaml` describes a Render web service.

Local profile saves are ignored by Git to keep player data out of the public repository. Back them up separately if you need to preserve them.

## Checks

```powershell
npm run lint
npm test
npm run build
```

The project includes `.env.example` for deployment environments. Do not commit real API keys or private environment files.
