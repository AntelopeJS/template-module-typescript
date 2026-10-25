# AntelopeJS module

An AntelopeJS module built from the `template-module-typescript` template. `ajs module init` copies this repository into a new project, so every file here, this one included, is the starting point of a generated module. `antelopejs-module`, the `template-module` interface and its `Log` function are placeholders to rename.

## Layout

- `src/index.ts` holds the module lifecycle (`construct`, `start`, `stop`, `destroy`) and binds each interface to its implementation with `ImplementInterface`.
- `src/interfaces/<name>/<version>/` declares the interfaces this module provides. Other modules import them through the `exports` subpaths of `package.json` (`antelopejs-module/dist/interfaces/...`), so renaming or moving a file there is a breaking change.
- `src/implementations/<name>/<version>/` implements them, with the same layout.
- `test/*.test.ts` are mocha suites. `antelope.test.ts` is the `antelopeJs.test` config that `ajs module test` reads: it compiles the module with `tsc`, loads it, then runs the suites against the loaded module.
- `playground/` is a separate project in the pnpm workspace that runs the built module (`pnpm dev`). It keeps its own lockfile (`shared-workspace-lockfile=false`), and the root `pnpm install` installs it too.

## Checks

Finish every change with `pnpm run checks`: typecheck, lint, format, knip, `pnpm test`, size, ratchet and sync, printing only what failed. `guardrails.ratchet.json` records the lint findings the template already had; its numbers only go down. After you remove debt, run `pnpm run ratchet:update` and commit the lowered file. The pre-commit hook rejects new findings on the lines you add. `ajs module init` installs dependencies before `git init`, so run `pnpm install` once in a new repository to install the hook.

`pnpm run checks` does not cover:

- the playground's type-check and build (lint, format and the ratchet do cover its files): run `pnpm build && pnpm --dir playground build`. CI runs `pnpm --dir playground build` after the checks, reusing the `dist/` that `ajs module test` compiled, so it fails if the module has no tests to run.
- the type of the test files: `typecheck` reads only `src/`, and `ajs module test` runs the suites without type-checking them.

## Versioning

`@antelopejs/interface-core` stays a wide `>=0.1.1 <1.0.0` range, because this module only calls it. A module that implements an interface caps its range below the next minor of that interface, since a new minor may add functions it has to implement.

<!-- antelopejs-guardrails:start -->
<!-- Managed by @antelopejs/tooling-configs. `antelopejs-sync` rewrites everything between these markers; write repository-specific guidance outside them. -->

## Guardrails

Lint with `oxlint` and format with `oxfmt`; both read the configs at the repository root. Fix every finding: no rule warns.

### Comments

Say it in code. A constraint belongs in a type, a lint rule, or a test. A public item's contract belongs in TSDoc (`/** */`) on that item. The only other comments are lint directives that name their rules, `@ts-expect-error <reason>`, `SAFETY: <reason>` above a type assertion, `/*!` license headers, and bundler or formatter directives.

### Tests

Hold every test you write or keep to this checklist:

- Name the wrong implementation this test fails on. A test with no answer is deleted, not kept.
- No test reads the file it tests. Drive the behaviour through the public interface.
- An invariant over many files is a lint rule, not a test.

### What enforces what

| Rule                                                                           | Enforced by                               |
| ------------------------------------------------------------------------------ | ----------------------------------------- |
| Formatting                                                                     | oxfmt                                     |
| Lint findings are errors; no rule warns                                        | oxlint preset                             |
| Comments are TSDoc, directives, or `SAFETY:` only                              | `antelopejs/no-comments`                  |
| Every test asserts                                                             | `antelopejs/require-assertion`            |
| Tests read no files outside fixtures, helpers, locales                         | `antelopejs/no-fs-read-in-tests`          |
| No assertion that restates a constant                                          | `antelopejs/no-constant-value-assertion`  |
| No test whose only check is "is a function"                                    | `antelopejs/no-typeof-function-only-test` |
| Params ≤ 5, function ≤ 120 lines, file ≤ 500 lines, depth ≤ 4, complexity ≤ 20 | `eslint/max-*`, `eslint/complexity`       |

<!-- antelopejs-guardrails:end -->
