import { FastifyInstance } from "fastify";
import {
  clearStablePlaylistsCache,
  fetchListing,
  fetchPlaylistTracks,
  isPlaylistStable,
  playlistCache,
  saveStablePlaylistsToDisk,
  stablePlaylistsMap,
  tracksCacheKey,
} from "./helpers.js";
import { TRACK_FETCH_DELAY_MS } from "./consts.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function registerAdminRoutes(fastify: FastifyInstance) {
  // Register basic auth for admin endpoints
  await fastify.register(import("@fastify/basic-auth"), {
    validate: async (username, password) => {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASS;

      if (!adminUsername || !adminPassword) {
        throw new Error("Admin credentials not configured");
      }

      if (username === adminUsername && password === adminPassword) {
        return;
      } else {
        throw new Error("Invalid credentials");
      }
    },
    authenticate: { realm: "Admin" },
  });

  // Admin endpoint to bust cache
  fastify.get(
    "/admin/cache/bust",
    { preHandler: fastify.basicAuth },
    async (_req, res) => {
      try {
        playlistCache.flushAll();
        await clearStablePlaylistsCache();
        return res.send({
          success: true,
          message:
            "In-memory cache and stable disk snapshot cleared; tracks will refetch from Spotify",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to clear cache",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Admin endpoint to refresh stable playlists from Spotify and overwrite JSON
  fastify.post(
    "/admin/cache/refresh-stable",
    { preHandler: fastify.basicAuth },
    async (_req, res) => {
      try {
        const playlists = await fetchListing();
        const stable = playlists.filter((p) =>
          isPlaylistStable(p.month, p.year),
        );
        for (const p of stable) {
          playlistCache.del(tracksCacheKey(p.id));
          stablePlaylistsMap.delete(p.id);
        }
        for (let i = 0; i < stable.length; i++) {
          await fetchPlaylistTracks(stable[i].id, { skipStableSave: true });
          if (i < stable.length - 1) await sleep(TRACK_FETCH_DELAY_MS);
        }
        await saveStablePlaylistsToDisk();
        return res.send({
          success: true,
          message: `Refreshed ${stable.length} stable playlists from Spotify`,
          count: stable.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to refresh stable playlists",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Admin endpoint to check cache status
  fastify.get(
    "/admin/cache/status",
    { preHandler: fastify.basicAuth },
    async (_req, res) => {
      try {
        const stats = playlistCache.getStats();
        const keys = playlistCache.keys();
        return res.send({
          success: true,
          stats,
          keys,
          stablePlaylistsCount: stablePlaylistsMap.size,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to get cache status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );
}
