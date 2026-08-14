# Contributing to wizard-api

Thank you for helping DripForge Wizard. This repo is the analysis service. The product also includes [wizard-ui](https://github.com/Drip-Forge/wizard-ui) and [wizard-contracts](https://github.com/Drip-Forge/wizard-contracts) — read [docs/architecture.md](docs/architecture.md) before changing the `/analyze` response shape, because both siblings depend on it.

## Local setup

- Node.js 20+
- `npm install`
- `npm test`
- `npm run dev` (listens on `3001`)

Run [wizard-ui](https://github.com/Drip-Forge/wizard-ui/blob/main/docs/getting-started.md) in another terminal to click through the analyzer.

## Drips Wave

This project is prepared for [Drips Wave](https://www.drips.network/solutions/wave) contribution cycles.

1. Pick an issue (or open one with the Wave task template). Comment to claim it before you start.
2. Keep discussion on the issue / PR — no private side channels for implementation decisions.
3. Branch from `main`, name it `feat/…`, `fix/…`, or `docs/…`.
4. Link the PR to the issue. Include a test plan: `npm test` plus a curl or UI screenshot for API changes.
5. Do not force-push to `main`. Do not commit `.env` files or real private keys.

Replace the placeholder in [`FUNDING.json`](FUNDING.json) only when you are the maintainer claiming the repo on Drips.

## Response contract

Treat these fields as public API:

- `drips.ethereum.ownedBy`
- `_metadata.*`
- `splitsProposal.*`
- `warnings`

If you rename or remove one, update [docs/api.md](docs/api.md), [wizard-ui `src/lib/api.ts`](https://github.com/Drip-Forge/wizard-ui/blob/main/src/lib/api.ts), and mention the break in the PR.

## Good first contributions

- Extra fixture tests in `test/analyze.test.ts`
- Support for `includeDevDependencies` in the UI
- Parsers for non-npm manifests (coordinate with wizard-contracts)
- OpenAPI / Scalar docs generated from the Zod schemas

## License

By contributing you agree that your work is licensed under the MIT License in [LICENSE](LICENSE).
