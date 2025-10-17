import { FastifyInstance } from "fastify";
import { join } from "path";

export const registerStaticRoutes = async (fastify: FastifyInstance) => {
  const nodeEnv = process.env.NODE_ENV || "development";

  // Serve static files in production
  if (nodeEnv === "production") {
    await fastify.register(import("@fastify/static"), {
      root: join(process.cwd(), "../client/dist"),
      prefix: "/",
    });
  }
};
