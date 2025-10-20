# Use Bun's official image
FROM oven/bun:1 as base
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-alpine as production
WORKDIR /app

# Copy package files for workspace install (runtime deps only)
COPY package.json bun.lock ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
COPY packages/shared/package.json ./packages/shared/

# Install only production dependencies for all workspaces
RUN bun install --frozen-lockfile --production

# Copy built application from base stage
COPY --from=base /app/packages/server/dist ./packages/server/dist
COPY --from=base /app/packages/client/dist ./packages/client/dist

# Use the server package as the working directory so static paths resolve
WORKDIR /app/packages/server

# Expose port
EXPOSE 3000

# Start the server
CMD ["bun", "dist/index.js"]
