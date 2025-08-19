# AntelopeJS Module Template

A template repository for creating AntelopeJS interfaces and their implementations. Use this template to start developing new interfaces or implementing existing ones.

## 🚀 Quick Start

1. **Start development mode**:

   ```bash
   pnpm run dev
   ```

2. **The playground will run your module** and you can see the Log function in action.

## 🏗️ Module Structure

```
src/
├── interfaces/           # Interface definitions
│   └── your-interface-name/
│       └── beta/
│           └── index.ts  # Interface definition
├── implementations/      # Interface implementations
│   └── your-interface-name/
│       └── beta/
│           └── index.ts  # Implementation
└── index.ts             # Module entry point

playground/
├── src/
│   └── index.ts         # Test your module here
├── package.json
└── antelope.json        # AntelopeJS project configuration
```

## 📖 Understanding the Template

### Interface Definition

The template includes a simple logging interface (`src/interfaces/template-module/beta/index.ts`):

```typescript
import { InterfaceFunction } from "@ajs/core/beta";

/**
 * This interface defines a basic template-module interface in beta version.
 * It contains a function to log a message which is implemented by the module as a console,
 * but other modules could implement the interface differently.
 */
export const Log = InterfaceFunction<(message: string) => Promise<void>>();
```

### Implementation

The console implementation (`src/implementations/template-module/beta/index.ts`):

```typescript
export function Log(message: string) {
  console.log(message);
  return Promise.resolve();
}
```

## 🔧 Customization

### Creating Your Own Module

1. **Rename the module** in `package.json`:

   ```json
   {
     "name": "your-module-name"
   }
   ```

2. **Update interface paths**:

   - Rename `template-module` directories to your interface name
   - Update imports in `src/index.ts`

3. **Define your interfaces**:

   - Add your interface functions in `src/interfaces/your-interface-name/beta/index.ts`
   - Use proxies to define your interface contracts

4. **Implement your interfaces**:

   - Create implementations in `src/implementations/your-interface-name/beta/index.ts`
   - Ensure function signatures match your interfaces exactly

5. **Test in playground**:
   - Update `playground/src/index.ts` to test your interfaces
   - Use `@ajs/your-interface-name/beta` imports

## 🛠️ Available Scripts

- `pnpm run build` - Build the module for distribution
- `pnpm run dev` - Start development mode with hot reload
- `pnpm run dev:prepare` - Prepare playground dependencies
- `pnpm run generate` - Generate module exports
- `pnpm run prepare` - Install module dependencies

## 🧪 Testing

The playground serves as a testing environment. To test your module:

1. Implement your logic in `playground/src/index.ts`
2. Run `pnpm run dev`
3. Check console output for results

## 📚 Documentation

- [AntelopeJS Documentation](https://antelopejs.com/docs/get-started)
- [Module Architecture](https://antelopejs.com/docs/interfaces/module-management)
- [Proxy System](https://antelopejs.com/docs/interfaces/proxies)
