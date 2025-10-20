import { FastifyInstance } from "fastify";
import { authAndFetchPlaylists } from "./helpers.js";

export const registerApiRoutes = async (fastify: FastifyInstance) => {
  // API routes
  fastify.get("/playlists", async (_req, reply) => {
    try {
      const playlists = await authAndFetchPlaylists();
      return reply.send(playlists);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      fastify.log.error({ err: e }, "Failed to fetch playlists");
      return reply
        .status(500)
        .send({ message: "Failed to fetch playlists", error: message });
    }
  });
};
