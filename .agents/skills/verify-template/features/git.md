---
covers:
  - .gitignore
  - .npmrc
docs:
  - README.md
journeys:
  - scaffold-gitignore
---

# Git

What git leaves out of every module created from the template; a dropped line commits secrets or build output.

## Sub-features

- `scaffold-gitignore`: `.env`, `.env.local`, `node_modules`, `dist`, `coverage`, `.antelope/cache` and the playground's `node_modules` and `dist` are ignored, sources are not, and after install, build and a `.env` no secret, dependency or build file is left untracked. This is the Exposure door's journey.

## How to get to it (user POV)

- `git status` in a new module.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" git
```

## Gotchas

- `.npmrc` sets `shared-workspace-lockfile=false`, which keeps the playground's lockfile separate; `scaffold-checks` and `playground-dev` install with `--frozen-lockfile` and fail when it is dropped.
