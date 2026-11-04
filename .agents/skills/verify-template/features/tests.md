---
covers:
  - antelope.test.ts
  - test/**
docs:
  - README.md
journeys:
  - module-test
  - module-test-fails
---

# Tests

The module's test setup: `antelope.test.ts` and `test/log.test.ts`, run by `pnpm test` through `ajs module test`.

## Sub-features

- `module-test`: `pnpm test` passes and the output names the Log test and `1 passing`.
- `module-test-fails`: a test that throws, added to the module, makes `pnpm test` fail with its message and `1 failing`.

## How to get to it (user POV)

- `pnpm test` in the new module.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" tests
```

## Gotchas

- `ajs module test` compiles the module with `tsc` first, so the journeys need no separate build.
