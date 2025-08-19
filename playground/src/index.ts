import { Log } from "@ajs/template-module/beta";

export function construct(config: unknown): void {}

export async function start(): Promise<void> {
  // Test Log function from our interfaces
  Log("Hello world");
}

export function destroy(): void {}

export function stop(): void {}
