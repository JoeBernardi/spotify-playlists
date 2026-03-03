import { FastifyInstance } from "fastify";
import {
  fetchListing,
  fetchPlaylistTracks,
  fetchStats,
} from "./helpers.js";
import { cacheTTLInSeconds } from "./consts.js";

export const registerApiRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/playlists/stats", async (_req, reply) => {
    try {
      const stats = await fetchStats();
      return reply
        .header("Cache-Control", `public, max-age=${cacheTTLInSeconds}`)
        .send(stats);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      fastify.log.error({ err: e }, "Failed to fetch stats");
      return reply
        .status(500)
        .send({ message: "Failed to fetch stats", error: message });
    }
  });

  fastify.get("/playlists", async (_req, reply) => {
    try {
      const playlists = await fetchListing();
      return reply
        .header("Cache-Control", `public, max-age=${cacheTTLInSeconds}`)
        .send(playlists);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      fastify.log.error({ err: e }, "Failed to fetch playlists");
      return reply
        .status(500)
        .send({ message: "Failed to fetch playlists", error: message });
    }
  });

  fastify.get<{ Params: { id: string } }>(
    "/playlists/:id/tracks",
    async (req, reply) => {
      try {
        const tracks = await fetchPlaylistTracks(req.params.id);
        fastify.log.info(
          `Sending ${tracks.length} tracks for playlist ${req.params.id}`,
        );
        return reply
          .header("Cache-Control", `public, max-age=${cacheTTLInSeconds}`)
          .send(tracks);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        fastify.log.error(
          { err: e },
          `Failed to fetch tracks for playlist ${req.params.id}`,
        );
        return reply
          .status(500)
          .send({ message: "Failed to fetch tracks", error: message });
      }
    },
  );
};
