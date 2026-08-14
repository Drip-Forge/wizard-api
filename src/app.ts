import Fastify from "fastify";
import cors from "@fastify/cors";
import { analyzeRoutes } from "./routes/analyze.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  // Enable CORS for frontend integration
  app.register(cors, {
    origin: true
  });

  // Register endpoints
  app.register(analyzeRoutes);

  app.get("/health", async () => {
    return { status: "OK", service: "wizard-api" };
  });

  return app;
}
