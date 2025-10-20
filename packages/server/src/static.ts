import { FastifyInstance } from "fastify";
import { join } from "path";
import { existsSync } from "fs";

export const registerStaticRoutes = async (fastify: FastifyInstance) => {
  const clientDistRoot = join(process.cwd(), "../client/dist");

  if (existsSync(join(clientDistRoot, "index.html"))) {
    fastify.log.info({ clientDistRoot }, "Registering static client assets");

    await fastify.register(import("@fastify/static"), {
      root: clientDistRoot,
      prefix: "/",
    });

    // Explicitly serve index.html at root
    fastify.get("/", async (_req, reply) => {
      // @ts-ignore sendFile is provided by @fastify/static
      return reply.sendFile("index.html");
    });

    // SPA fallback: use not-found handler to serve index.html for GET routes
    fastify.setNotFoundHandler(async (req, reply) => {
      if (req.method === "GET") {
        // @ts-ignore sendFile is provided by @fastify/static
        return reply.sendFile("index.html");
      }
      return reply.status(404).send({ message: "Not Found" });
    });
  } else {
    fastify.log.warn(
      { clientDistRoot },
      "Client dist not found; static routes not registered"
    );
  }
};
