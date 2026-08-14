# Architecture

```
package.json  →  wizard-ui (browser)
                      │
                      │  POST /analyze
                      ▼
                 wizard-api  ──►  FUNDING.json + splitsProposal + warnings
                      │
                      │  account IDs resolved off-chain
                      ▼
              wizard-contracts
              DependencySplits.applyAnalyzedSplits
                      │
                      ▼
              Drips AddressDriver.setSplits
```

## This service's job

`wizard-api` is deliberately **off-chain**. It never talks to Ethereum. It:

- Accepts a Node `package.json` (body or query string)
- Requires a `name`, optionally `dependencies` / `devDependencies` / `drips`
- Checks `ownedBy` is a 20-byte hex address when present
- Emits the exact JSON object Drips expects inside `FUNDING.json`
- Builds a **deterministic** splits proposal: 80% owner / 20% equal pool across production dependencies (weights use Drips' 1,000,000 scale)

Account IDs for those dependencies are **not** known here. The UI or an integrator maps package names to Drips accounts, sorts by `accountId`, then submits the list to [`DependencySplits`](https://github.com/Drip-Forge/wizard-contracts/blob/main/docs/contracts.md).

## Module layout

| Path | Role |
| --- | --- |
| `src/index.ts` | Process entry, binds `HOST`/`PORT` |
| `src/app.ts` | Fastify factory (CORS, routes) — used by tests via `inject` |
| `src/routes/analyze.ts` | `GET` and `POST /analyze` |
| `src/routes/health.ts` | Liveness |
| `src/services/analyze.ts` | Pure analysis; throws `AnalyzeError` |
| `src/schemas/packageJson.ts` | Zod schemas |
| `src/config.ts` | Weight constants and env |

## Why POST was missing in the scaffold

The original route registered **only** `GET /analyze`, while [wizard-ui](https://github.com/Drip-Forge/wizard-ui) sent `POST`. Both methods are registered now. POST with a JSON body is the supported path; GET with `?packageJson=` remains for quick curls.

## Related docs

- [HTTP API](api.md)
- [Drips integration](drips-integration.md)
- [wizard-ui architecture](https://github.com/Drip-Forge/wizard-ui/blob/main/docs/architecture.md)
- [wizard-contracts architecture](https://github.com/Drip-Forge/wizard-contracts/blob/main/docs/architecture.md)
