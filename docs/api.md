# HTTP API

Base URL locally: `http://localhost:3001`

CORS is open (`*`) unless `CORS_ORIGIN` is set to a comma-separated list (see `.env.example`).

## `GET /health`

```json
{
  "status": "OK",
  "service": "wizard-api",
  "stack": "DripForge Wizard"
}
```

## `POST /analyze`

**Body (typical, used by wizard-ui):** the `package.json` object itself.

```json
{
  "name": "my-drips-project",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "drips": {
    "ethereum": {
      "ownedBy": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    }
  }
}
```

**Wrapped body** (optional):

```json
{
  "packageJson": { "name": "my-drips-project", "dependencies": { "lodash": "^4.17.21" } },
  "ownedBy": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "dependencyPoolWeight": 200000,
  "includeDevDependencies": false
}
```

**Query overrides** (also apply to GET):

| Param | Meaning |
| --- | --- |
| `ownedBy` | Overrides `drips.ethereum.ownedBy` |
| `includeDevDependencies` | `true` to fold `devDependencies` into the pool |
| `packageJson` | Raw JSON string (GET only) |

### Success (`200`)

```json
{
  "drips": {
    "ethereum": {
      "ownedBy": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
    }
  },
  "_metadata": {
    "projectName": "my-drips-project",
    "version": "1.0.0",
    "analyzedAt": "2026-08-14T14:00:00.000Z",
    "dependenciesCount": 1,
    "devDependenciesCount": 0,
    "peerDependenciesCount": 0
  },
  "splitsProposal": {
    "totalWeight": 1000000,
    "ownerWeight": 800000,
    "dependencyPoolWeight": 200000,
    "leftoverWeight": 0,
    "dependencies": [
      { "name": "lodash", "version": "^4.17.21", "suggestedWeight": 200000 }
    ]
  },
  "warnings": []
}
```

Commit **only** `{ "drips": { ... } }` as `FUNDING.json`. `_metadata` and `splitsProposal` are helper fields for the UI and for [wizard-contracts](https://github.com/Drip-Forge/wizard-contracts).

Weights use Drips' `TOTAL_SPLITS_WEIGHT` of **1,000,000**. 200,000 = 20%. Remainder after integer division is distributed one weight unit at a time so the pool always sums exactly.

If there are no production dependencies, `dependencyPoolWeight` is `0` and the owner keeps 100%.

If `ownedBy` is omitted, the API still succeeds but sets the [zero address](https://docs.drips.network/get-support/claim-your-repository/) and adds a warning. Do not claim a repo with that file.

### Errors

| Status | When |
| --- | --- |
| `400` | Missing body / invalid `packageJson` query JSON |
| `422` | Zod failure (`name` missing) or `ownedBy` is not `0x` + 40 hex chars |

## `GET /analyze`

Same handler as POST. Pass `?packageJson=<url-encoded JSON>`.

## Related docs

- [Architecture](architecture.md)
- [wizard-ui FileUpload](https://github.com/Drip-Forge/wizard-ui/blob/main/src/components/FileUpload.tsx)
- [wizard-contracts SplitsLib](https://github.com/Drip-Forge/wizard-contracts/blob/main/docs/contracts.md)
