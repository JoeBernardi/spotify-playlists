# Deployment Guide

This guide explains how to deploy the Spotify Playlists application to different environments.

## Environment Configuration

### Development (Default)

- **Client**: Runs on `http://localhost:5173`
- **Server**: Runs on `http://localhost:3000`
- **API calls**: Use `http://localhost:3000`

### Production

- **Client**: Served by the server or a CDN
- **Server**: Configurable port via `PORT` environment variable
- **API calls**: Use same origin or `VITE_API_URL` environment variable

## Environment Variables

### Server Environment Variables

Create a `.env` file in the `packages/server/` directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Spotify API Configuration (required)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_SECRET=your_spotify_secret
SPOTIFY_USER=your_spotify_username
```

### Client Environment Variables

Create a `.env` file in the `packages/client/` directory (optional):

```bash
# API Configuration (optional)
# If not set, will use same origin in production
VITE_API_URL=https://your-api-domain.com
```

## Deployment Scenarios

### 1. Single Server Deployment (Recommended)

Deploy both client and server on the same domain:

1. Build the client: `bun run build:client`
2. Serve the client from the server
3. Set `NODE_ENV=production`
4. The client will automatically use the same origin for API calls

### 2. Separate Client and Server Deployment

If deploying client and server separately:

1. Set `VITE_API_URL` to your server's URL
2. Configure server CORS to allow your client domain
3. Update server CORS configuration in `packages/server/src/index.ts`

### 3. Docker Deployment

Create a `Dockerfile` in the root directory:

```dockerfile
FROM oven/bun:1 as builder

WORKDIR /app
COPY package.json bun.lock ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
COPY packages/client ./packages/client

RUN bun install
RUN bun run build

FROM oven/bun:1

WORKDIR /app
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/client/dist ./public

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "dist/index.js"]
```

### 4. Platform-Specific Deployment

#### Vercel

- Deploy server as a serverless function
- Deploy client as a static site
- Set `VITE_API_URL` to your Vercel serverless function URL

#### Railway/Render

- Deploy as a single application
- Set environment variables in the platform dashboard
- Use the single server deployment approach

#### Heroku

- Add a `Procfile`: `web: bun dist/index.js`
- Set environment variables in Heroku dashboard
- Use the single server deployment approach

## CORS Configuration

The server automatically configures CORS based on the environment:

- **Development**: Allows `http://localhost:5173`
- **Production**: Allows all origins (configurable)

To restrict CORS in production, update the server configuration:

```typescript
const corsOrigins =
  nodeEnv === "development"
    ? ["http://localhost:5173"]
    : ["https://yourdomain.com", "https://www.yourdomain.com"];
```

## Build Commands

```bash
# Build everything
bun run build

# Build individual packages
bun run build:server
bun run build:client

# Start production server
bun run start
```

## Troubleshooting

### API Connection Issues

1. Check that `VITE_API_URL` is set correctly
2. Verify server CORS configuration
3. Ensure server is running on the correct port

### Environment Variable Issues

1. Verify `.env` files are in the correct directories
2. Check that environment variables are properly loaded
3. Restart the server after changing environment variables

### Build Issues

1. Run `bun run clean` before building
2. Ensure all dependencies are installed with `bun install`
3. Check TypeScript compilation with `bun run type-check`
