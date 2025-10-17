import { FastifyInstance } from "fastify";
import { authAndFetchPlaylists } from "./helpers.js";

export const registerApiRoutes = async (fastify: FastifyInstance) => {
  // API routes
  fastify.get("/playlists", async (_req, res) => {
    const playlists = await authAndFetchPlaylists().catch((e: Error) =>
      Promise.reject(e)
    );

    return res.send(playlists);
  });
};
