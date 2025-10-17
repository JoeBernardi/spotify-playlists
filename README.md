# Spotify Playlists Monorepo

A monorepo containing a Fastify server and React client for managing Spotify playlists.

## Structure

```
packages/
├── client/          # React + Vite frontend
├── server/          # Fastify backend
└── shared/          # Shared types and utilities
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Bun >= 1.0.0

### Installation

```bash
bun install
```

### Development

Start both server and client in development mode:

```bash
bun run dev
```

Or start them individually:

```bash
# Start server only
bun run dev:server

# Start client only
bun run dev:client
```

### Building

Build all packages:

```bash
bun run build
```

Build individual packages:

```bash
bun run build:server
bun run build:client
```

### Environment Variables

Create a `.env` file in the server package with:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_SECRET=your_secret
SPOTIFY_USER=your_username
```

## Packages

### @spotify-playlists/shared

Shared types and utilities used by both client and server.

### @spotify-playlists/server

Fastify server that:

- Serves the React client
- Provides API endpoints for Spotify data
- Handles authentication and caching

### @spotify-playlists/client

React application built with Vite that:

- Displays Spotify playlists
- Provides music player functionality
- Uses TanStack Router for navigation

## Scripts

- `bun run dev` - Start development servers for both packages
- `bun run build` - Build all packages
- `bun run lint` - Lint all packages
- `bun run clean` - Clean all build artifacts
- `bun run type-check` - Type check all packages
