import Fastify from "fastify";
import { registerAdminRoutes } from "./admin.js";
import { registerStaticRoutes } from "./static.js";
import { registerApiRoutes } from "./api.js";

const fastify = Fastify({ logger: true });

async function main() {
  // Get environment variables
  const port = parseInt(process.env.PORT || "3000", 10);
  const nodeEnv = process.env.NODE_ENV || "development";

  // Configure CORS based on environment
  const corsOrigins =
    nodeEnv === "development"
      ? ["http://localhost:5173"] // Vite dev server
      : true; // Allow all origins in production (you may want to restrict this)

  await fastify.register(import("@fastify/cors"), {
    origin: corsOrigins,
    credentials: true,
  });

  await registerStaticRoutes(fastify);
  await registerApiRoutes(fastify);
  await registerAdminRoutes(fastify);

  // Diagnostics: verify client dist registration/visibility
  fastify.get("/__static-check", async (_req, reply) => {
    try {
      const cwd = process.cwd();
      const nodeEnv = process.env.NODE_ENV || "development";
      return reply.send({ ok: true, cwd, nodeEnv });
    } catch (e) {
      return reply
        .status(500)
        .send({ ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  });

  // Fallback now handled in registerStaticRoutes

  await fastify.listen({ port, host: "0.0.0.0" });
  const address = fastify.server.address();

  if (!address || typeof address === "string") {
    throw new Error("Server address is null: " + address);
  }

  console.log(`Server listening on ${address.port}`);
}

main().catch(console.error);
