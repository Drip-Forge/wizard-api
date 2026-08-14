import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AnalyzeOptionsSchema, PackageJsonSchema } from "../schemas/packageJson.js";
import { AnalyzeError, analyzePackageJson } from "../services/analyze.js";

type AnalyzeQuery = {
  packageJson?: string;
  ownedBy?: string;
  includeDevDependencies?: string;
};

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function extractPayload(request: FastifyRequest): { pkg: unknown; options: unknown } {
  const query = request.query as AnalyzeQuery;
  const body = request.body as Record<string, unknown> | undefined;

  if (body && typeof body === "object" && body.packageJson) {
    return {
      pkg: body.packageJson,
      options: {
        ownedBy: body.ownedBy ?? query.ownedBy,
        dependencyPoolWeight: body.dependencyPoolWeight,
        includeDevDependencies: body.includeDevDependencies ?? parseBoolean(query.includeDevDependencies)
      }
    };
  }

  if (body && typeof body === "object" && typeof body.name === "string") {
    return {
      pkg: body,
      options: {
        ownedBy: query.ownedBy,
        includeDevDependencies: parseBoolean(query.includeDevDependencies)
      }
    };
  }

  if (query.packageJson) {
    try {
      return {
        pkg: JSON.parse(query.packageJson),
        options: {
          ownedBy: query.ownedBy,
          includeDevDependencies: parseBoolean(query.includeDevDependencies)
        }
      };
    } catch {
      throw new AnalyzeError("Invalid packageJson query parameter: must be JSON", 400);
    }
  }

  throw new AnalyzeError(
    "Send a package.json object as the JSON body, or pass it as the packageJson query parameter.",
    400
  );
}

async function handleAnalyze(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = extractPayload(request);
    const parsedPkg = PackageJsonSchema.safeParse(payload.pkg);
    if (!parsedPkg.success) {
      return reply.status(422).send({
        error: "Validation failed",
        details: parsedPkg.error.flatten()
      });
    }

    const parsedOptions = AnalyzeOptionsSchema.safeParse(payload.options ?? {});
    if (!parsedOptions.success) {
      return reply.status(422).send({
        error: "Invalid analyze options",
        details: parsedOptions.error.flatten()
      });
    }

    return reply.send(analyzePackageJson(parsedPkg.data, parsedOptions.data));
  } catch (error) {
    if (error instanceof AnalyzeError) {
      return reply.status(error.statusCode).send({
        error: error.message,
        details: error.details
      });
    }
    throw error;
  }
}

export async function analyzeRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ["GET", "POST"],
    url: "/analyze",
    handler: handleAnalyze
  });
}
