---
covers:
  - playground/**
docs:
  - README.md
journeys:
  - playground-dev
---

# Playground

The project that loads the built module and calls `Log`, which is what `pnpm dev` runs.

## Sub-features

- `playground-dev`: after `pnpm build`, the playground builds with `pnpm --dir playground build`, `ajs project dev --watch` in it prints `Hello world` through the module's implementation of `Log` and keeps running, and Ctrl+C exits 130.

## How to get to it (user POV)

- `pnpm dev` in the new module.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" playground
```

## Gotchas

- The playground has its own lockfile; the root `pnpm install` installs it too.
