# AntelopeJS module

An AntelopeJS module built from the `template-module-typescript` template. `ajs module init` copies this repository into a new project, so every file here, this one included, is the starting point of a generated module. `antelopejs-module`, the `template-module` interface and its `Log` function are placeholders to rename.

## Layout

- `src/index.ts` holds the module lifecycle (`construct`, `start`, `stop`, `destroy`) and binds each interface to its implementation with `ImplementInterface`.
- `src/interfaces/<name>/<version>/` declares the interfaces this module provides. Other modules import them through the `exports` subpaths of `package.json` (`antelopejs-module/dist/interfaces/...`), so renaming or moving a file there is a breaking change.
- `src/implementations/<name>/<version>/` implements them, with the same layout.
- `test/*.test.ts` are mocha suites. `antelope.test.ts` is the `antelopeJs.test` config that `ajs module test` reads: it compiles the module with `tsc`, loads it, then runs the suites against the loaded module.
- `playground/` is a separate project in the pnpm workspace that runs the built module (`pnpm dev`). It keeps its own lockfile (`shared-workspace-lockfile=false`), and the root `pnpm install` installs it too.

## Checks

Finish every change with `pnpm run checks`: typecheck, lint, format, knip, `pnpm test`, size, suppressions, sync and the lockfile checks, printing only what failed. `guardrails.suppressions.json` records no suppression, so every lint finding fails `pnpm run lint`. The pre-commit hook formats, lints, size-checks and ratchets the files you stage, and the pre-push hook runs `typecheck`.

The scripts, hooks and CI expect pnpm (`packageManager` in `package.json`); a module created with another `--pm` must switch to pnpm. `pnpm.onlyBuiltDependencies` is empty, so no dependency runs install scripts; this stops lefthook's own `postinstall` from installing hooks, so only `prepare` installs them, and only when this directory is the repository root. `ajs module init` installs dependencies before `git init`, so run `pnpm install` once in the new repository to install the hooks, then make the first commit, whose hook formats the `package.json` the CLI rewrote.

`pnpm run checks` does not cover:

- the playground's type-check and build (lint, format and the ratchet do cover its files): run `pnpm build && pnpm --dir playground build`. CI runs `pnpm --dir playground build` after the checks, reusing the `dist/` that `ajs module test` compiled. `pnpm test` fails when `test/` holds no suite.
- the type of the test files: `typecheck` reads only `src/`, and `ajs module test` runs the suites without type-checking them.

## Versioning

Every `@antelopejs/*` range stops below the next minor of its floor: `>=0.5.1 <0.6.0` on a 0.x package, `~1.23.3` on a 1.x one, consumed interfaces included, since AntelopeJS packages ship breaking changes in minor releases. The `@antelopejs/interface-core` range appears in `package.json` and `playground/package.json`; change both together. The `dependency:ranges` step of `pnpm run checks` enforces it in every tracked `package.json`.

<!-- antelopejs-guardrails:start -->
<!-- Managed by @antelopejs/tooling-configs. `antelopejs-sync` rewrites everything between these markers; write repository-specific guidance outside them. -->

## Guardrails

Lint with `oxlint` and format with `oxfmt`; both read the configs at the repository root. Fix every finding: no rule warns.

### Comments

Say it in code: a constraint in a type, a lint rule or a test, a public item's contract in TSDoc. Other comments are lint directives naming their rules, `@ts-expect-error <reason>`, `SAFETY: <reason>` above a type assertion, and license or tool directives. A reason states what the code does now.

### Tests

Each test names the wrong implementation it fails on, or is deleted. Drive behaviour through the public interface. An invariant over many files is a lint rule.

### Review

No tool checks these:

- A type guard checks the nested elements and values it claims.
- A no-upward import rule rejects same-tier peers; probe it with an import.
- A finding only an evasion or a patched internal can trigger goes under Attention and never blocks.

<!-- antelopejs-guardrails:end -->
