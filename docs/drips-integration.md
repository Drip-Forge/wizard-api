# Drips integration

[Drips](https://drips.network) funds open-source GitHub repositories with ERC-20 streams and automatic dependency splits. Wizard-api covers the **claim file** and a **suggested split table**. It does not submit Ethereum transactions.

## 1. Claim file

Drips proves ownership by reading `FUNDING.json` on the repository **default branch**:

```json
{
  "drips": {
    "ethereum": {
      "ownedBy": "0xYourAddress"
    }
  }
}
```

That shape is exactly `AnalyzeResult.drips` wrapped as `{ "drips": ... }` — which is what [wizard-ui](https://github.com/Drip-Forge/wizard-ui) downloads.

Official walkthrough: [Claim your open-source project](https://docs.drips.network/get-support/claim-your-repository/).

## 2. Splits proposal → on-chain

After a project is claimed, incoming funds split according to a receivers list (maintainers + dependencies). Each receiver is a Drips **account ID** and a **weight** out of 1,000,000. Lists must be sorted, unique, non-zero, and at most 200 entries. See the [protocol overview](https://docs.drips.network/the-protocol/overview/).

`splitsProposal` is that list **before** account IDs exist:

| Field | On-chain analogue |
| --- | --- |
| `ownerWeight` | Weight for the project owner / maintainer account |
| `dependencies[].suggestedWeight` | Weight for that package's Drips project, once mapped |
| `totalWeight` | `SplitsLib.TOTAL_SPLITS_WEIGHT` |

[wizard-contracts](https://github.com/Drip-Forge/wizard-contracts) `SplitsLib.validate` enforces the same rules. `DependencySplits.applyAnalyzedSplits` writes the list through Drips `AddressDriver.setSplits` for a **contract-owned** account.

GitHub-repo splits after a `FUNDING.json` claim are usually configured in the Drips app (RepoDriver). Both paths consume the same weight math this API emits.

## 3. What this API will not do

- Resolve npm package names to GitHub repos or Drips account IDs
- Talk to AddressDriver / RepoDriver
- Support Cargo.toml / go.mod yet — that is a documented extension point (see [CONTRIBUTING.md](../CONTRIBUTING.md))

## Related docs

- [HTTP API](api.md)
- [wizard-contracts integration](https://github.com/Drip-Forge/wizard-contracts/blob/main/docs/integration.md)
- [wizard-ui docs hub](https://github.com/Drip-Forge/wizard-ui/blob/main/src/app/docs/page.tsx)
