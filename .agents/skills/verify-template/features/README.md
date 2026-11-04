# Feature map

One file per feature. `covers:` lists the source globs it owns, `docs:` the pages a verdict judges, `journeys:` the journeys it runs, and `seeded-breaks/<feature>.patch` the break its journeys must catch. `pnpm exec antelopejs-verify map` checks that every user-facing file is covered: in a template that is every file `ajs` copies.

| Feature | What the user does | Journeys |
|---|---|---|
| [module](module.md) | Creates a module and builds it. | scaffold-shape, module-build |
| [playground](playground.md) | Runs the playground that calls the module's `Log`. | playground-dev |
| [tests](tests.md) | Runs `pnpm test`. | module-test, module-test-fails |
| [tooling](tooling.md) | Runs typecheck, lint, knip and `pnpm run checks`. | scaffold-lint, scaffold-lint-rejects, scaffold-checks |
| [docs](docs.md) | Reads the README, CONTRIBUTING and the license. | scaffold-docs |
| [git](git.md) | Commits in a module whose `.gitignore` the template wrote. | scaffold-gitignore |
| [smoke](smoke.md) | The fixed journey every verdict runs: create, install, build. | module-build |

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" smoke
```

## Gotchas

- The smoke feature covers no glob, so it never marks a file as mapped.
- The template creates modules, not projects: the journeys run `ajs module init` against the offline manifest. The shared `scaffold-dev` and `scaffold-checks` journeys run `ajs project init`, so no feature names them.
