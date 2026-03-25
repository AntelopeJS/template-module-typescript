import { ImplementInterface } from "@ajs/core";

export async function construct(): Promise<void> {
  ImplementInterface(
    await import("./interfaces/template-module"),
    await import("./implementations/template-module")
  );
}

export function start(): void {}

export function destroy(): void {}

export function stop(): void {}
