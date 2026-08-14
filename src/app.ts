import Fastify, { type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { getCorsOrigin } from "./config.js";
import { analyzeRoutes } from "./routes/analyze.js";
import { healthRoutes } from "./routes/health.js";

export function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true
  });

  app.register(cors, {
    origin: getCorsOrigin()
  });

  app.register(healthRoutes);
  app.register(analyzeRoutes);

  return app;
}
