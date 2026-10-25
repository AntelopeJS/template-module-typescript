# AntelopeJS Module TypeScript Template

<div align="center">
<a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache_2.0-000000?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/sjK28QHrA7"><img src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000" alt="Discord"></a>
<a href="https://framework.antelopejs.com/docs/module-development/creating-a-module"><img src="https://img.shields.io/badge/Docs-18181B?style=for-the-badge&color=000000" alt="Documentation"></a>
</div>

A starter for a module that defines an AntelopeJS interface and implements it, with a playground project that calls it.

## What you get

```
my-module/
├── src/
│   ├── interfaces/template-module/beta/index.ts       # the contract: export const Log = InterfaceFunction<...>()
│   ├── implementations/template-module/beta/index.ts  # the code behind Log
│   └── index.ts                                       # construct() binds them with ImplementInterface
├── test/
│   └── log.test.ts           # checks that Log reaches the implementation
├── playground/               # an AntelopeJS project that loads this module and calls Log
│   ├── src/index.ts
│   ├── antelope.config.ts
│   └── package.json
├── antelope.test.ts          # test configuration, referenced by antelopeJs.test
├── AGENTS.md                 # repository facts and rules for coding agents
├── oxlint.config.ts          # lint, format and dead-code configs from @antelopejs/tooling-configs
├── oxfmt.config.ts
├── knip.config.ts
├── .nvmrc                    # Node 24, used by CI
├── lefthook.yml              # pre-commit lint, format, size and ratchet hooks; pre-push typecheck
├── guardrails.ratchet.json   # lint debt ceilings (empty: the template has none)
├── package.json
└── tsconfig.json
```

## Create it

Install the CLI once with `pnpm add -g @antelopejs/core`, then create a module from this template:

```bash
ajs module init my-module --template "Module Typescript" --pm pnpm
```

The command copies the template and installs its dependencies. It installs before `git init`, so run `pnpm install` once more in the new repository to install the pre-commit hooks. Run `ajs module init my-module` without flags to answer the questions interactively, and pick pnpm: the scripts, hooks and CI use it.

## Run it

One root `pnpm install` installs both the module and playground dependencies. Each package keeps its own lockfile to preserve its dependency resolution. The playground imports the built module: build once, then start it.

```bash
cd my-module
pnpm install
pnpm build
pnpm dev
```

`pnpm dev` runs the playground project in watch mode (`ajs project run -w -p playground`). It builds both modules, and the playground prints `Hello world` through the `Log` interface.

| Command           | What it does                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `pnpm dev`        | Runs the playground in watch mode                                                        |
| `pnpm build`      | Builds the module into `dist/`                                                           |
| `pnpm test`       | Builds the module, starts it, and runs the `test/*.test.ts` files with `ajs module test` |
| `pnpm run checks` | Runs typecheck, lint, format, knip, the tests, size, ratchet and sync checks             |

## Make it yours

1. Rename the module in `package.json` (`name` and `antelopeJs.implements`), `antelope.test.ts`, `playground/antelope.config.ts` and `playground/package.json`.
2. Rename the `template-module` folders under `src/interfaces/` and `src/implementations/` to your interface name, and update the imports in `src/index.ts`, `playground/src/index.ts` and `test/`.
3. Declare your functions in the interface and implement them with the same signatures.

## Next steps

- [Creating a module](https://framework.antelopejs.com/docs/module-development/creating-a-module): the module layout and its `package.json`.
- [Exporting interfaces](https://framework.antelopejs.com/docs/module-development/exporting-interfaces): publish your interface for other modules.
- [Proxies](https://framework.antelopejs.com/docs/concepts/proxies): how `InterfaceFunction` queues calls until a module implements it.
- [Testing](https://framework.antelopejs.com/docs/module-development/testing): write module tests.

Using Claude Code or Codex? Install the [AntelopeJS agent skills plugin](https://github.com/AntelopeJS/agent-skills) so your agent knows the framework and its CLI.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Run `pnpm install` then `pnpm run checks` before you open a pull request.

## License

[Apache-2.0](./LICENSE)
