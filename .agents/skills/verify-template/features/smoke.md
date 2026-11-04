---
covers:
docs:
  - README.md
journeys:
  - module-build
---

# Smoke

The fixed journey every verdict runs, whatever the diff touches: create a module through `ajs module init` from an offline manifest, install, build, and load what the build wrote.

## Sub-features

- `module-build`: as in [module](module.md).

## How to get to it (user POV)

- `ajs module init my-module --template "Module Typescript"`, then `pnpm build`.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" smoke
```

## Gotchas

- The shared `scaffold-dev` journey runs `ajs project init`, which cannot create a module template, so the smoke feature runs the repo-owned `module-build` instead.
