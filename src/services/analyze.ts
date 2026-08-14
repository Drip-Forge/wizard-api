import {
  DEFAULT_DEPENDENCY_POOL_WEIGHT,
  TOTAL_SPLITS_WEIGHT,
  ZERO_ADDRESS
} from "../config.js";
import type { AnalyzeOptions, PackageJsonInput } from "../schemas/packageJson.js";
import { isEthereumAddress, isZeroAddress } from "../utils/address.js";

export class AnalyzeError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AnalyzeError";
  }
}

export type DependencyEntry = {
  name: string;
  version: string;
  suggestedWeight: number;
};

export type SplitsProposal = {
  totalWeight: number;
  ownerWeight: number;
  dependencyPoolWeight: number;
  leftoverWeight: number;
  dependencies: DependencyEntry[];
};

export type AnalyzeResult = {
  drips: {
    ethereum: {
      ownedBy: string;
    };
  };
  _metadata: {
    projectName: string;
    version?: string;
    analyzedAt: string;
    dependenciesCount: number;
    devDependenciesCount: number;
    peerDependenciesCount: number;
  };
  splitsProposal: SplitsProposal;
  warnings: string[];
};

function count(record?: Record<string, string>): number {
  return record ? Object.keys(record).length : 0;
}

function resolveOwner(pkg: PackageJsonInput, ownedBy?: string): { address: string; warnings: string[] } {
  const warnings: string[] = [];
  const address = ownedBy ?? pkg.drips?.ethereum?.ownedBy ?? ZERO_ADDRESS;

  if (!isEthereumAddress(address)) {
    throw new AnalyzeError(
      "ownedBy must be a 20-byte Ethereum address (0x followed by 40 hex characters)",
      422,
      { ownedBy: address }
    );
  }

  if (isZeroAddress(address)) {
    warnings.push(
      "Owner is the zero address. Replace it with your wallet before committing FUNDING.json and claiming the repo on Drips."
    );
  }

  return { address, warnings };
}

function buildSplitsProposal(
  pkg: PackageJsonInput,
  options: AnalyzeOptions
): SplitsProposal {
  const includeDev = options.includeDevDependencies === true;
  const poolCap = options.dependencyPoolWeight ?? DEFAULT_DEPENDENCY_POOL_WEIGHT;

  const production = Object.entries(pkg.dependencies ?? {});
  const extra = includeDev ? Object.entries(pkg.devDependencies ?? {}) : [];
  const merged = new Map<string, string>();
  for (const [name, version] of [...production, ...extra]) {
    merged.set(name, version);
  }

  const names = [...merged.keys()].sort((a, b) => a.localeCompare(b));
  const dependencyPoolWeight = names.length === 0 ? 0 : poolCap;
  const ownerWeight = TOTAL_SPLITS_WEIGHT - dependencyPoolWeight;

  const base = names.length === 0 ? 0 : Math.floor(dependencyPoolWeight / names.length);
  let remainder = names.length === 0 ? 0 : dependencyPoolWeight - base * names.length;

  const dependencies: DependencyEntry[] = names.map((name) => {
    const extraWeight = remainder > 0 ? 1 : 0;
    remainder = Math.max(0, remainder - extraWeight);
    return {
      name,
      version: merged.get(name) ?? "",
      suggestedWeight: base + extraWeight
    };
  });

  const assigned = ownerWeight + dependencies.reduce((sum, dep) => sum + dep.suggestedWeight, 0);

  return {
    totalWeight: TOTAL_SPLITS_WEIGHT,
    ownerWeight,
    dependencyPoolWeight,
    leftoverWeight: TOTAL_SPLITS_WEIGHT - assigned,
    dependencies
  };
}

export function analyzePackageJson(pkg: PackageJsonInput, options: AnalyzeOptions = {}): AnalyzeResult {
  const owner = resolveOwner(pkg, options.ownedBy);
  const splitsProposal = buildSplitsProposal(pkg, options);

  return {
    drips: {
      ethereum: {
        ownedBy: owner.address
      }
    },
    _metadata: {
      projectName: pkg.name,
      version: pkg.version,
      analyzedAt: new Date().toISOString(),
      dependenciesCount: count(pkg.dependencies),
      devDependenciesCount: count(pkg.devDependencies),
      peerDependenciesCount: count(pkg.peerDependencies)
    },
    splitsProposal,
    warnings: owner.warnings
  };
}
