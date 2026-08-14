---
name: Bug report
about: Something in wizard-api does not match the documented HTTP contract
labels: ["bug"]
---

## What happened

## What you expected

## Repro

```bash
curl -X POST http://localhost:3001/analyze -H 'content-type: application/json' -d '{ ... }'
```

## Environment

- Node version:
- Commit SHA:

Related repos: this may also affect [wizard-ui](https://github.com/Drip-Forge/wizard-ui) if the response shape changed.
