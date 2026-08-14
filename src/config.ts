export const TOTAL_SPLITS_WEIGHT = 1_000_000;
export const MAX_SPLITS_RECEIVERS = 200;

/** Default share of incoming funds forwarded to production dependencies (20%). */
export const DEFAULT_DEPENDENCY_POOL_WEIGHT = 200_000;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function getPort(): number {
  return process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001;
}

export function getHost(): string {
  return process.env.HOST ?? "0.0.0.0";
}

export function getCorsOrigin(): true | string | string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw === "*") {
    return true;
  }
  const origins = raw.split(",").map((value) => value.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
}
