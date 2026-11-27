---
name: verify-template
description: "Drive this module template the way a new user does: scaffold a module from the working tree with `ajs module init --template`, install it, build it, make the first commit through its hooks, run its own `pnpm run checks`, build the playground and run `pnpm dev` until it logs `Hello world`. Use to prove a change to the template works before merge, or to verify a PR."
---

# Verify template

A user of this template runs `ajs module init --template module-typescript`. They get a copy of the repository without `.agents/` and `.claude/skills/`, and expect it to install, commit, pass its checks and run. `capture.sh` walks that path on a module scaffolded from your working tree, uncommitted changes included, and keeps the output of each step as evidence. No step reaches GitHub or the interface catalog.

## Run it

Run it from the repository root after `pnpm install`:

```bash
run="${TMPDIR:-/tmp}/verify-template-$(date +%Y%m%d-%H%M%S)"
bash .agents/skills/verify-template/capture.sh "$run"
```

The argument is a directory that does not exist yet or is empty. The script prints nothing when every step passes. When a step fails, it prints `FAIL <step>`, the last 20 lines of that step's output, and the path of its log, then exits 1. A whole run takes about 15 seconds on a warm pnpm store.

## Steps

Each step runs in a scratch folder under `<run>/work`, with its own `HOME`, `CI=1`, `AJS_NO_UPDATE_CHECK=1` and `NO_COLOR=1`:

| Step               | What it runs                                                                                                                                       | What passing proves                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `snapshot`         | Commits the working tree (tracked and untracked, not ignored) to a local git repository, and lists it in a local catalog `manifest.json`          | The template the next steps scaffold is your change      |
| `init`             | `ajs module init app --git <catalog> --template local-template --interfaces "" --pm pnpm --git-init`, with the `ajs` of this repository's `@antelopejs/core` | The CLI accepts the template and installs it             |
| `scaffold-files`   | Lists the files of the new module                                                                                                                  | `.agents/` and `.claude/skills/` were left out           |
| `install`          | `pnpm install --frozen-lockfile`                                                                                                                   | The lockfiles match, and `prepare` installs the hooks    |
| `build`            | `pnpm build`                                                                                                                                       | The module compiles                                      |
| `first-commit`     | `git add -A` and `git commit`, through the pre-commit hook                                                                                        | The hook formats, lints and size-checks a fresh module   |
| `checks`           | `pnpm run checks`                                                                                                                                  | The module's own checks pass                             |
| `playground-build` | `pnpm --dir playground build`                                                                                                                      | The playground type-checks against the built module      |
| `dev`              | `pnpm dev` in its own process group until the output holds `Hello world`, then SIGINT to the group                                                | The playground loads the module and calls its interface  |

## Evidence

The script deletes `<run>/work` when it ends, whether a step passed or failed, and stops the `pnpm dev` it started. Only `<run>/logs` stays:

- `<NN>-<step>.log`: the command, then its stdout and stderr.
- `dev.log`: the whole output of `pnpm dev`, the `Stopped the project` line included.

Read the logs before you call a run a pass. A step proves only what it runs. Quote the `Checks:` line of `07-checks.log` and the `Hello world` line of `dev.log` in the PR body.

## Gotchas

- The scaffold leaves out `.agents/` and `.claude/skills/`, so a generated module never carries this skill.
- `build` runs before `first-commit` on purpose. The hook lints `playground/src/index.ts`, which imports the module from `dist/`, so a commit before the first build fails with `antelopejs(require-tsconfig-include)`.
- The script does not cover what CI runs beyond the module's own checks: Windows, and the merge-queue suite.
- The `/capture` API of `@antelopejs/tooling-configs` does not apply here. `antelopejs-capture` screenshots browser routes of the DMS demo, and this template has no page to show and is never loaded by that demo.
