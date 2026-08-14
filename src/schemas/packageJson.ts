import { z } from "zod";

const stringRecord = z.record(z.string());

export const PackageJsonSchema = z
  .object({
    name: z.string({ required_error: "package.json name is required" }).min(1, "name must not be empty"),
    version: z.string().optional(),
    description: z.string().optional(),
    dependencies: stringRecord.optional(),
    devDependencies: stringRecord.optional(),
    peerDependencies: stringRecord.optional(),
    optionalDependencies: stringRecord.optional(),
    drips: z
      .object({
        ethereum: z
          .object({
            ownedBy: z.string()
          })
          .optional()
      })
      .passthrough()
      .optional()
  })
  .passthrough();

export type PackageJsonInput = z.infer<typeof PackageJsonSchema>;

export const AnalyzeOptionsSchema = z.object({
  ownedBy: z.string().optional(),
  dependencyPoolWeight: z.number().int().min(0).max(1_000_000).optional(),
  includeDevDependencies: z.boolean().optional()
});

export type AnalyzeOptions = z.infer<typeof AnalyzeOptionsSchema>;
