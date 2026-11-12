<a href="https://github.com/AntelopeJS/antelopejs"><img data-illustration src="./.github/readme/strip.svg" width="100%" alt="TEMPLATE · MODULE TYPESCRIPT: part of AntelopeJS, hexagonal architecture beyond your own code. A glowing button reads Star AntelopeJS."></a>

<div align="center">

# AntelopeJS module TypeScript template

<a href="./LICENSE"><img data-illustration alt="License" src="https://img.shields.io/badge/License-Apache_2.0-000000?style=for-the-badge&labelColor=000000"></a> <a href="https://discord.gg/g4pFt6eXqu"><img data-illustration alt="Discord" src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000"></a> <a href="https://framework.antelopejs.com/docs/module-development/creating-a-module"><img data-illustration alt="Documentation" src="https://img.shields.io/badge/Docs-18181B?style=for-the-badge&color=000000"></a> <a href="https://github.com/AntelopeJS/antelopejs"><img data-illustration alt="Star AntelopeJS" src="https://img.shields.io/github/stars/AntelopeJS/antelopejs?label=Star%20AntelopeJS&style=for-the-badge&labelColor=000000&color=000000&logo=github"></a>

**Template for an AntelopeJS module that defines an interface and implements it, with a playground project that calls it.**

[Documentation](https://framework.antelopejs.com/docs/module-development/creating-a-module) · [All interfaces and providers](https://github.com/AntelopeJS/antelopejs#ecosystem)

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
├── .nvmrc                    # the Node version CI uses
├── lefthook.yml              # pre-commit lint, format, size and ratchet hooks, pre-push typecheck
├── package.json
└── tsconfig.json
```

## Create it

Create a module from this template:

```bash
npx @antelopejs/core module init my-module --template module-typescript --pm pnpm
```

The command copies the template and installs its dependencies. It installs before `git init`, so run `pnpm install` once more in the new repository to install the pre-commit hooks. Run `npx @antelopejs/core module init my-module` without flags to answer the questions interactively, and pick pnpm, because the scripts, hooks and CI use it.

## Run it

One root `pnpm install` installs both the module and playground dependencies. Each package keeps its own lockfile to preserve its dependency resolution. The playground imports the built module, so build once, then start it.

```bash
cd my-module
pnpm install
pnpm build
pnpm dev
```

`pnpm dev` runs the playground project in watch mode (`ajs project run -w -p playground`). It builds both modules, and the playground prints `Hello world` through the `Log` interface.

| Command           | What it does                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev`        | Runs the playground in watch mode                                                           |
| `pnpm build`      | Builds the module into `dist/`                                                              |
| `pnpm test`       | Builds the module, starts it, and runs the `test/*.test.ts` files with `ajs module test`    |
| `pnpm run checks` | Runs typecheck, lint, format, knip, the tests, size, suppressions, sync and lockfile checks |

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

## Part of AntelopeJS

This template belongs to [AntelopeJS](https://github.com/AntelopeJS/antelopejs), the TypeScript framework where modules depend on contracts and the application chooses the provider. The open-source back office [AntelopeJS DMS](https://github.com/AntelopeJS/dms) is built on it.

## License

[Apache-2.0](./LICENSE)
