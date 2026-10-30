# AntelopeJS module

An AntelopeJS module built from the `template-module-typescript` template. `ajs module init` copies this repository into a new project, so every file here, this one included, is the starting point of a generated module. `antelopejs-module`, the `template-module` interface and its `Log` function are placeholders to rename.

## Layout

- `src/index.ts` holds the module lifecycle (`construct`, `start`, `stop`, `destroy`) and binds each interface to its implementation with `ImplementInterface`.
- `src/interfaces/<name>/<version>/` declares the interfaces this module provides. Other modules import them through the `exports` subpaths of `package.json` (`antelopejs-module/dist/interfaces/...`), so renaming or moving a file there is a breaking change.
- `src/implementations/<name>/<version>/` implements them, with the same layout.
- `test/*.test.ts` are mocha suites. `antelope.test.ts` is the `antelopeJs.test` config that `ajs module test` reads: it compiles the module with `tsc`, loads it, then runs the suites against the loaded module.
- `playground/` is a separate project in the pnpm workspace that runs the built module (`pnpm dev`). It keeps its own lockfile (`shared-workspace-lockfile=false`), and the root `pnpm install` installs it too.

## Checks

Finish every change with `pnpm run checks`: typecheck, lint, format, knip, `pnpm test`, size, ratchet and sync, printing only what failed. `guardrails.ratchet.json` is empty, so every lint finding fails `pnpm run lint`. Its numbers only go down: never add an entry to it. The pre-commit hook formats, lints, size-checks and ratchets the files you stage, and the pre-push hook runs `typecheck`.

The scripts, hooks and CI expect pnpm (`packageManager` in `package.json`); a module created with another `--pm` must switch to pnpm. `pnpm.onlyBuiltDependencies` is empty, so no dependency runs install scripts; this stops lefthook's own `postinstall` from installing hooks, so only `prepare` installs them, and only when this directory is the repository root. `ajs module init` installs dependencies before `git init`, so run `pnpm install` once in the new repository to install the hooks, then make the first commit, whose hook formats the `package.json` the CLI rewrote.

`pnpm run checks` does not cover:

- the playground's type-check and build (lint, format and the ratchet do cover its files): run `pnpm build && pnpm --dir playground build`. CI runs `pnpm --dir playground build` after the checks, reusing the `dist/` that `ajs module test` compiled. `pnpm test` fails when `test/` holds no suite.
- the type of the test files: `typecheck` reads only `src/`, and `ajs module test` runs the suites without type-checking them.
- the interface range rule below: run `pnpm exec antelopejs-check-interface-ranges`.

## Versioning

`@antelopejs/interface-core` stays a wide `>=0.1.1 <1.0.0` range, because this module only calls it. A module that implements an interface caps its range below the next minor of that interface, since a new minor may add functions it has to implement.

<!-- antelopejs-guardrails:start -->
<!-- Managed by @antelopejs/tooling-configs. `antelopejs-sync` rewrites everything between these markers; write repository-specific guidance outside them. -->

## Guardrails

Lint with `oxlint` and format with `oxfmt`; both read the configs at the repository root. Fix every finding: no rule warns.

Prove a change works with the verification skill in [`.agents/skills/verify-template/SKILL.md`](.agents/skills/verify-template/SKILL.md) before you call it done.

### Comments

Say it in code. A constraint belongs in a type, a lint rule, or a test. A public item's contract belongs in TSDoc (`/** */`) on that item. The only other comments are lint directives that name their rules, `@ts-expect-error <reason>`, `SAFETY: <reason>` above a type assertion, `/*!` license headers, and bundler or formatter directives.

Before suppressing a type rule, try inference or a type derived from its owner with `Parameters`, `ReturnType`, or indexed access. A private alias can still appear in a published declaration. Keep a suppression only after checking the published contract and the unchecked boundary it protects.

Check each directive reason against the current line and its callers. Returning a value is not the same as awaiting and discarding it. A reason must describe what the code does now.

### Tests

Hold every test you write or keep to this checklist:

- Name the wrong implementation this test fails on. A test with no answer is deleted, not kept.
- No test reads the file it tests. Drive the behaviour through the public interface.
- An invariant over many files is a lint rule, not a test.

### Cleanup proof

A behaviour-preserving cleanup PR shows `antelopejs-api-diff <base-ref>` passing. Published declarations, built runtime exports and the names and signatures a DMS frontend module auto-imports stay unchanged; pass `--allow-added <glob>` (repeatable, e.g. `'**/internal/**'`) to let added entries under that glob pass when their module is `@internal`, and copy its "Added (allowed)" list. Every export under a directory that `dms.frontend.build.ts` auto-imports is published, `@internal` or not; a helper that must stay private goes under `app/build/`. A comment-only PR shows `antelopejs-comment-proof <base-ref>` passing instead of a verifier. Both compare committed HEAD.

Copy the proof's whole output into the PR body, down to its closing `<!-- antelopejs-proof ... -->` line, which stamps the command, base, committed head and a digest. Never type counts by hand. List the lint findings a PR leaves in place by pasting the block `antelopejs-body-check --findings` prints and replacing each `<why>`. `antelopejs-body-check <body.md>` fails an edited or stale proof block, proof output outside one, and a findings line that is not a live diagnostic at HEAD; counts in prose are not checked, so leave them out. The table counts a lint directive once per rule it names, inline directives included.

Pass `--probe <file.cjs>` to api-diff when changing receivers, positional calls, or modules that no published entry reaches. The same captured script runs against both worktree roots, supplied as `argv[2]`, and prints JSON observations. Matching metadata alone does not prove those behaviours.

An entry-only rule exempts only its own module. Add a second module entry rather than exempting another importer. A no-upward rule must reject peers in the same tier as well as higher tiers. Probe the rank decision with an import, not just a reading of the configuration.

Moving a method body into a function keeps how it is called: the same receiver, argument count, read order and laziness.

Verify a boundary against the imports a developer or agent would plausibly write: static and dynamic imports, re-exports, Vue `src`, CSS `@import`, and worker or child-process entries in normally named files. A construction only an evasion would write, an edit to resolution configuration (`package.json` `browser`, `exports`, `main` or `imports`, bundler aliases, tsconfig `paths`), and a difference observable only by patching private fields or internal methods go under Attention and never block. Public API and ordinary subclass behaviour stay part of the contract.

### What enforces what

| Rule                                                                           | Enforced by                                         |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Formatting                                                                     | oxfmt                                               |
| Lint findings are errors; no rule warns                                        | oxlint preset                                       |
| Comments are TSDoc, directives, or `SAFETY:` only                              | `antelopejs/no-comments`                            |
| Every test asserts                                                             | `antelopejs/require-assertion`                      |
| Tests read no files outside fixtures, helpers, locales                         | `antelopejs/no-fs-read-in-tests`                    |
| Tests import the code under test from local source, not their own package name | `antelopejs/no-self-import-in-tests`                |
| No assertion that restates a constant                                          | `antelopejs/no-constant-value-assertion`            |
| No test whose only check is "is a function"                                    | `antelopejs/no-typeof-function-only-test`           |
| String-keyed object tables are read through own keys only                      | `antelopejs/no-inherited-key-lookup`                |
| A type guard checks each member it narrows to; keys with `Object.hasOwn`       | `antelopejs/no-presence-only-type-guard`            |
| A type guard checks the nested elements and values it claims                   | review; no tool                                     |
| Params ≤ 5, function ≤ 120 lines, file ≤ 500 lines, depth ≤ 4, complexity ≤ 20 | `eslint/max-*`, `eslint/complexity`                 |
| Cleanup preserves declarations, runtime exports and DMS auto-imports           | `antelopejs-api-diff <base-ref>`                    |
| Comment-only changes preserve JavaScript emit                                  | `antelopejs-comment-proof <base-ref>`               |
| PR-body proof tables are copied unedited from the current head                 | `antelopejs-body-check <body.md>`                   |
| PR-body findings-left lines are live diagnostics at HEAD                       | `antelopejs-body-check <body.md>`                   |
| Receiver, positional and unpublished-module behaviour                          | `antelopejs-api-diff <base-ref> --probe <file.cjs>` |
| Directive and `SAFETY:` reasons are true of the code                           | review; no tool                                     |
| Evasion-only and patched-internal findings go under Attention                  | review; no tool                                     |
| No-upward rules reject same-tier peers                                         | review and import probes                            |
| No `@ts-ignore`                                                                | `typescript/ban-ts-comment`                         |
| No once-used type parameter standing in for `unknown`                          | `typescript/no-unnecessary-type-parameters`         |
| No `any` passed, assigned or returned where a type is declared                 | `typescript/no-unsafe-{argument,assignment,return}` |

<!-- antelopejs-guardrails:end -->
