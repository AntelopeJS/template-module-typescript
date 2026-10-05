# AntelopeJS Module Template

<div align="center">
<a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge&labelColor=000000"></a>
<a href="https://discord.gg/sjK28QHrA7"><img src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000" alt="Discord"></a>
</div>

A template for creating AntelopeJS interfaces and their implementations. Use this template to start developing new interfaces or implementing existing ones.

## Quick start

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development mode:

   ```bash
   pnpm run dev
   ```

The playground runs your module automatically. You should see the `Log` function output in the console.

## Module structure

```
src/
├── interfaces/                       # Interface definitions
│   └── template-module/
│       └── beta/
│           └── index.ts
├── implementations/                  # Interface implementations
│   └── template-module/
│       └── beta/
│           └── index.ts
└── index.ts                          # Module entry point

test/
└── log.test.ts                       # Module tests

playground/
├── src/
│   └── index.ts                      # Test your module here
├── antelope.config.ts                # AntelopeJS project configuration
└── package.json

antelope.test.ts                      # Test configuration
```

## Understanding the template

### Interface definition

The template includes a simple logging interface:

```typescript
// src/interfaces/template-module/beta/index.ts
import { InterfaceFunction } from "@antelopejs/interface-core";

export const Log = InterfaceFunction<(message: string) => Promise<void>>();
```

The `InterfaceFunction` creates a proxy that queues calls until an implementation is registered. Other modules can provide their own implementation of this interface.

### Implementation

The console implementation provides a concrete version of the interface:

```typescript
// src/implementations/template-module/beta/index.ts
export function Log(message: string) {
  console.log(message);
  return Promise.resolve();
}
```

### Module entry point

The entry point registers the implementation against the interface during the `construct` lifecycle hook:

```typescript
// src/index.ts
import { ImplementInterface } from "@antelopejs/interface-core";

export async function construct(): Promise<void> {
  ImplementInterface(
    await import("./interfaces/template-module/beta"),
    await import("./implementations/template-module/beta")
  );
}
```

### Tests

`antelope.test.ts` is the test configuration that `antelopeJs.test` points to in `package.json`. It loads the module itself, built with `tsc`, and runs the `*.test.ts` files of the `test/` folder with Mocha:

```bash
pnpm test
```

In tests, an interface function rejects unless a loaded module implements it, so `test/log.test.ts` checks that `Log` reaches the module implementation. Type annotations in the `.ts` test files rely on the type stripping of Node.js, enabled by default from Node.js 22.18.

## Customization

### Create your own module

1. Rename the module in `package.json`:

   ```json
   {
     "name": "your-module-name"
   }
   ```

2. Rename the `template-module` directories under `interfaces/` and `implementations/` to your interface name.

3. Define your interface functions in `src/interfaces/your-interface-name/beta/index.ts`.

4. Create matching implementations in `src/implementations/your-interface-name/beta/index.ts`. Function signatures must match the interface definitions exactly.

5. Update `src/index.ts` to import from the new paths.

6. Update the playground to test your interfaces:
   - Add your module as a local dependency in `playground/package.json`.
   - Import from your module package in `playground/src/index.ts`.

7. Update the tests:
   - Rename the module in `antelope.test.ts`.
   - Import from your module package in the `test/` files.

## Available scripts

- `pnpm run build` — Build the module for distribution.
- `pnpm run dev` — Start development mode with the playground in watch mode.
- `pnpm test` — Run the module tests with `ajs module test`.

## Learn more

- [AntelopeJS Documentation](https://antelopejs.com/docs/get-started)
- [Module Architecture](https://antelopejs.com/docs/interfaces/module-management)
- [Proxy System](https://antelopejs.com/docs/interfaces/proxies)
- [Testing](https://antelopejs.com/docs/module-development/testing)
