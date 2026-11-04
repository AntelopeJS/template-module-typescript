---
covers:
  - README.md
  - CONTRIBUTING.md
  - AGENTS.md
  - LICENSE
docs:
  - README.md
journeys:
  - scaffold-docs
---

# Docs

The pages the user reads first.

## Sub-features

- `scaffold-docs`: every `pnpm` command the README names exists as a script, it names dev, build and test and the `ajs module init` command, and CONTRIBUTING, AGENTS.md and the license are in the new module.

## How to get to it (user POV)

- Opening the README of a new module.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" docs
```

## Gotchas

- None.
