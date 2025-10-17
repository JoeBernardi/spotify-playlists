# Use Bun's official image
FROM oven/bun:1 as base
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lockb* ./
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

# Copy package files
COPY package.json bun.lockb* ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (needed for client build)
RUN bun install --frozen-lockfile

# Copy built application from base stage
COPY --from=base /app/packages/server/dist ./packages/server/dist
COPY --from=base /app/packages/client/dist ./packages/client/dist

# Expose port
EXPOSE 3000

# Start the server
CMD ["bun", "run", "packages/server/dist/index.js"]
