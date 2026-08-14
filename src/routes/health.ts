import type { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    return {
      status: "OK",
      service: "wizard-api",
      stack: "DripForge Wizard"
    };
  });
}
