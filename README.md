# wizard-api

Fastify + TypeScript analysis service for **DripForge Wizard**. It reads a Node `package.json`, validates it, and returns:

1. A Drips-compatible [`FUNDING.json`](https://docs.drips.network/get-support/claim-your-repository/) body (`drips.ethereum.ownedBy`)
2. A **splits proposal** whose weights follow Drips rules (total ≤ 1,000,000)
3. Warnings when the owner address is missing or zero

This repository is one of three. Read them together:

| Layer | Repository | What it does |
| --- | --- | --- |
| UI | [wizard-ui](https://github.com/Drip-Forge/wizard-ui) | Dashboard that uploads `package.json` and downloads `FUNDING.json` |
| API | **wizard-api** (this repo) | Validation, manifest generation, suggested splits |
| Chain | [wizard-contracts](https://github.com/Drip-Forge/wizard-contracts) | On-chain validation + `DependencySplits.applyAnalyzedSplits` |

**Docs in this repo**

- [Documentation index](docs/README.md)
- [HTTP API](docs/api.md)
- [Architecture](docs/architecture.md)
- [Drips integration](docs/drips-integration.md)
- [Contributing](CONTRIBUTING.md)

Sibling docs: [wizard-ui getting started](https://github.com/Drip-Forge/wizard-ui/blob/main/docs/getting-started.md) · [wizard-contracts integration](https://github.com/Drip-Forge/wizard-contracts/blob/main/docs/integration.md)

## Quick start

```bash
npm install
cp .env.example .env   # optional
npm run dev            # http://localhost:3001
```

```bash
curl -s http://localhost:3001/health
curl -s -X POST http://localhost:3001/analyze \
  -H 'content-type: application/json' \
  -d '{"name":"demo","dependencies":{"zod":"^3.0.0"},"drips":{"ethereum":{"ownedBy":"0x71C7656EC7ab88b098defB751B7401B5f6d8976F"}}}'
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch mode via `tsx` |
| `npm test` | Node test runner against Fastify `inject` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled server |
| `npm run typecheck` | `tsc --noEmit` |

## Claiming this repo on Drips

`FUNDING.json` at the repo root is the Drips claim file. Replace the zero address with the maintainer wallet **before** claiming in the [Drips app](https://docs.drips.network/get-support/claim-your-repository/).

## License

[MIT](LICENSE) © Drip-Forge
