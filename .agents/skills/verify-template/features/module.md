---
covers:
  - src/**
  - package.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - .nvmrc
docs:
  - README.md
journeys:
  - scaffold-shape
  - module-build
---

# Module

The module the user gets: the four lifecycle hooks and the `ImplementInterface` binding in `src/index.ts`, the `template-module` interface and its implementation, and the manifest that points the runtime at `dist`.

## Sub-features

- `scaffold-shape`: `ajs module init` creates a `package.json` naming `antelopejs-module`, `dist/index.js`, `baseUrl` `dist`, `implements` itself and the documented scripts, with the interface, its implementation, the tests and the playground in place.
- `module-build`: `pnpm run build` writes `dist/index.js` and `dist/index.d.ts` whose exports are exactly `construct,destroy,start,stop`, and the `dist/interfaces/template-module/beta` subpath other modules import exports `Log`.

## How to get to it (user POV)

- `ajs module init my-module --template "Module Typescript" --pm pnpm`, then `pnpm install` and `pnpm build`.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" module
```

## Gotchas

- Every journey creates the module from an offline manifest of this working tree and installs with `pnpm install --frozen-lockfile`; nothing reaches GitHub.
