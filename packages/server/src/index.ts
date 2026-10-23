import Fastify from "fastify";
import { registerAdminRoutes } from "./admin.js";
import { registerStaticRoutes } from "./static.js";
import { registerApiRoutes } from "./api.js";
import {
  fetchListing,
  hydrateTrackCache,
  loadStablePlaylistsFromDisk,
  getSpotifyHealth,
} from "./helpers.js";

const fastify = Fastify({ logger: true });

async function main() {
  const port = parseInt(process.env.PORT || "3000", 10);
  const nodeEnv = process.env.NODE_ENV || "development";

  const corsOrigins = nodeEnv === "development" ? ["http://localhost:5173"] : false;

  await fastify.register(import("@fastify/cors"), {
    origin: corsOrigins,
    credentials: true,
  });

  await fastify.register(import("@fastify/compress"));

  await registerStaticRoutes(fastify);
  await registerApiRoutes(fastify);
  await registerAdminRoutes(fastify);

  fastify.get("/health/live", async (_req, reply) => reply.send({ ok: true }));
  fastify.get("/health/ready", async (_req, reply) => {
    const spotify = getSpotifyHealth();
    return reply.status(spotify.ready ? 200 : 503).send({ ok: spotify.ready, spotify });
  });

  console.log("Loading stable playlists from disk...");
  try {
    await loadStablePlaylistsFromDisk();
    console.log("Stable playlists loaded");
  } catch (e) {
    console.error("Failed to load stable playlists:", e);
  }

  console.log("Pre-warming playlist listing cache...");
  try {
    await fetchListing();
    console.log("Listing cache pre-warmed successfully");
  } catch (e) {
    console.error("Listing cache pre-warm failed:", e);
  }

  await fastify.listen({ port, host: "0.0.0.0" });

  // Hydrate track cache in background (sequential + delay to avoid rate limits)
  hydrateTrackCache();
  const address = fastify.server.address();

  if (!address || typeof address === "string") {
    throw new Error("Server address is null: " + address);
  }

  console.log(`Server listening on ${address.port}`);
}

main().catch(console.error);
