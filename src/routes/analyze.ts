import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const PackageJsonSchema = z.object({
  name: z.string({
    required_error: "name is required"
  }),
  version: z.string().optional(),
  description: z.string().optional(),
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  drips: z.object({
    ethereum: z.object({
      ownedBy: z.string()
    })
  }).optional()
});

export async function analyzeRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/analyze",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      let body: any = request.body;

      // In case the HTTP client doesn't support body in GET, fallback to query parameter
      if (!body && request.query) {
        const queryVal = (request.query as any).packageJson;
        if (queryVal) {
          try {
            body = JSON.parse(queryVal);
          } catch (e) {
            return reply.status(400).send({ error: "Invalid packageJson query parameter" });
          }
        }
      }

      if (!body) {
        return reply.status(400).send({
          error: "Request body (or packageJson query parameter) containing package.json is required."
        });
      }

      const parseResult = PackageJsonSchema.safeParse(body);
      if (!parseResult.success) {
        return reply.status(422).send({
          error: "Validation failed",
          details: parseResult.error.flatten()
        });
      }

      const pkg = parseResult.data;

      // Determine Ethereum address for Drips
      let ethAddress = "0x0000000000000000000000000000000000000000";
      if (pkg.drips?.ethereum?.ownedBy) {
        ethAddress = pkg.drips.ethereum.ownedBy;
      }

      const fundingSchema = {
        drips: {
          ethereum: {
            ownedBy: ethAddress
          }
        },
        _metadata: {
          projectName: pkg.name,
          analyzedAt: new Date().toISOString(),
          dependenciesCount: Object.keys(pkg.dependencies || {}).length,
          devDependenciesCount: Object.keys(pkg.devDependencies || {}).length
        }
      };

      return reply.send(fundingSchema);
    }
  });
}
