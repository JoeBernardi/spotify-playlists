import { FastifyInstance } from "fastify";
import { playlistCache } from "./helpers.js";

export async function registerAdminRoutes(fastify: FastifyInstance) {
  // Register basic auth for admin endpoints
  await fastify.register(import("@fastify/basic-auth"), {
    validate: async (username, password) => {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

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
        return res.send({
          success: true,
          message: "Cache cleared successfully",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to clear cache",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
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
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).send({
          success: false,
          message: "Failed to get cache status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
}
