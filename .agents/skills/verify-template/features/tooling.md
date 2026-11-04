---
covers:
  - tsconfig.json
  - oxlint.config.ts
  - oxfmt.config.ts
  - knip.config.ts
  - lefthook.yml
  - guardrails.suppressions.json
  - renovate.json
  - .github/**
docs:
  - CONTRIBUTING.md
  - AGENTS.md
journeys:
  - scaffold-lint
  - scaffold-lint-rejects
  - scaffold-checks
---

# Tooling

The guardrail configuration the user inherits: TypeScript, lint, format, knip, the suppression budget, the hooks, CI and Renovate.

## Sub-features

- `scaffold-lint`: `typecheck`, `lint` and `knip` pass in the new module.
- `scaffold-lint-rejects`: an unused local fails the typecheck and a `debugger` statement fails lint, so the configs are live.
- `scaffold-checks`: `pnpm run checks` passes after the first commit, whose hook formats the `package.json` that `ajs module init` rewrites (AGENTS.md documents the step).

## How to get to it (user POV)

- `pnpm run checks` before opening a pull request.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" tooling
```

## Gotchas

- Every journey creates the module from an offline manifest of this working tree and installs with `pnpm install --frozen-lockfile`; nothing reaches GitHub.
