import { ImplementInterface } from "@ajs/core/beta";

export async function construct(): Promise<void> {
  ImplementInterface(
    await import("./interfaces/template-module/beta"),
    await import("./implementations/template-module/beta")
  );
}

export function start(): void {}

export function destroy(): void {}

export function stop(): void {}
