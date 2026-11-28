---
name: verify-template-module-typescript
description: "Check a change to the template-module-typescript repository before pushing: the command for each kind of change, what CI already runs, and `capture.sh`, which scaffolds a module from the working tree with `ajs module init --template`, installs, builds and commits it through its hooks, runs its `pnpm run checks`, builds the playground and runs `pnpm dev` until it logs `Hello world`. Use to check a change here before pushing, or to verify a PR."
---

# Verify template-module-typescript

CI and the merge queue run every check. Run locally only the rows your diff touches, then read the CI result on the pull request.

## Setup

Node from `.nvmrc` (24) and pnpm from `packageManager` (`corepack enable`). Run `pnpm install` once per checkout. It installs the `playground/` project too, and the lefthook hooks when this directory is the repository root.

## Tools

Mocha through `ajs module test` (config in `antelope.test.ts`), `tsc` (`tsconfig.json`, `test/tsconfig.json`), oxlint (`oxlint.config.ts`), oxfmt (`oxfmt.config.ts`), knip (`knip.config.ts`) and lefthook (`lefthook.yml`), all at the repository root and from `@antelopejs/tooling-configs`.

## What to run for your change

| Change                                                                                                            | Command                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Source in `src/`                                                                                                  | `pnpm run typecheck`, `pnpm exec oxlint <files>`, `pnpm exec oxfmt --check <files>`, then the test row                                |
| Tests in `test/`                                                                                                  | `pnpm exec ajs module test -f test/<name>.test.ts --timeout 30000` and `pnpm exec tsc -p test/tsconfig.json --noEmit`                 |
| The playground in `playground/`                                                                                   | `pnpm build && pnpm --dir playground build`                                                                                           |
| Docs and skills (`*.md`, `.agents/skills/`)                                                                       | `pnpm exec oxfmt --check <files>`                                                                                                     |
| What `antelopejs-sync` writes (`.github/workflows/ci.yml`, the AGENTS.md Guardrails block, the preset configs)   | `pnpm run sync`, then `pnpm run sync:check`. Never edit these by hand                                                                 |
| Dependencies, `package.json`, `pnpm-workspace.yaml`                                                               | `pnpm install`, then `pnpm run checks`                                                                                                |
| Anything a scaffold copies and runs: scripts, hooks (`lefthook.yml`), configs, the module layout, the playground   | The scaffold run below                                                                                                                |

`ajs module test` compiles the module with `tsc`, loads it, then runs mocha in one process, one file at a time, so it never exceeds one worker. `pnpm run typecheck` reads only `src/`, hence the test row's own `tsc`. It takes about 2 seconds, so it runs whole.

## Services

No test needs one.

## The scaffold run

CI checks this repository, not a module scaffolded from it. A user runs `ajs module init --template module-typescript` and gets a copy without `.agents/` and `.claude/skills/`. `capture.sh` walks that path on a module scaffolded from your working tree, uncommitted changes included. No step reaches GitHub or the interface catalog. `init` and `install` still download packages from the npm registry.

```bash
run="${TMPDIR:-/tmp}/verify-template-module-typescript-$(date +%Y%m%d-%H%M%S)"
bash .agents/skills/verify-template-module-typescript/capture.sh "$run"
```

The argument is a missing or empty directory. The script prints nothing when every step passes. A failing step prints `FAIL <step>`, the last 20 lines of its output and the path of its log, then exits 1. Ctrl+C or SIGTERM stops the run, and it still cleans up. A whole run takes about 15 seconds.

Each step runs in `<run>/work`, with its own `HOME`, `CI=1`, `AJS_NO_UPDATE_CHECK=1`, `NO_COLOR=1` and `LEFTHOOK` unset. The own `HOME` means your `~/.npmrc` is not read. `npm_config_store_dir` keeps your pnpm store, so packages are not downloaded twice.

| Step               | What it runs                                                                                                                                                  | What passing proves                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `snapshot`         | Commits the working tree (tracked and untracked, not ignored) to a local git repository, and lists it in a local catalog `manifest.json`                     | The template the next steps scaffold is your change          |
| `init`             | `ajs module init app --git <catalog> --template local-template --interfaces "" --pm pnpm --git-init`, with the `ajs` of this repository's `@antelopejs/core` | The CLI accepts the template and installs it                 |
| `scaffold-files`   | Lists the files of the new module                                                                                                                             | `.agents/` and `.claude/skills/` were left out               |
| `install`          | `pnpm install --frozen-lockfile`                                                                                                                              | The lockfiles match, and `.git/hooks/pre-commit` exists      |
| `build`            | `pnpm build`                                                                                                                                                  | The module compiles                                          |
| `first-commit`     | `git add -A` and `git commit`, through the pre-commit hook                                                                                                   | The hook ran (its output names `antelopejs-lint`) and passed |
| `checks`           | `pnpm run checks`                                                                                                                                             | The module's own checks pass                                 |
| `playground-build` | `pnpm --dir playground build`                                                                                                                                 | The playground type-checks against the built module          |
| `dev`              | `pnpm dev` in its own process group until the output holds `Hello world`, then SIGINT to the group                                                           | The playground loads the module and calls its interface      |

The script deletes `<run>/work` when it ends, pass or fail, and stops the `pnpm dev` it started. Two runs can go side by side in different run directories. Only `<run>/logs` stays:

- `<NN>-<step>.log`: the command, then its stdout and stderr.
- `dev.log`: the whole output of `pnpm dev`, the `Stopped the project` line included. pnpm then prints `ELIFECYCLE  Command failed.` because the script stopped it with SIGINT. That line is not a failure.

Read the logs before you call a run a pass. Quote the `Checks:` line of `07-checks.log` and the `Hello world` line of `dev.log` in the PR body.

`build` runs before `first-commit` on purpose. The hook lints `playground/src/index.ts`, which imports the module from `dist/`, so a commit before the first build fails with `antelopejs(require-tsconfig-include)`.

## Left to CI

`.github/workflows/ci.yml` calls `AntelopeJS/.github/.github/workflows/ci-node.yml@v2` as the job `ci`. Read its result on the pull request and rerun none of it locally, apart from the row of a failing check to reproduce it:

- `ci / checks`: `pnpm run checks` in full (typecheck, lint, format, knip, every test, size, suppressions, `sync:check`, lockfiles), then `pnpm --dir playground build`, and the pull request title check.
- The merge queue runs the full suite on the merged result and retries a failed test once.
- The nightly schedule (or a `workflow_dispatch` with `nightly`) adds Stress, and the Windows leg while the repository is public.
- `verdict` fails when `ci` or `renovate-sync` failed or was cancelled.

## Done

A change is checked when every row its diff touches passed, with the command and its output shown in the pull request. A row that cannot run says why.
