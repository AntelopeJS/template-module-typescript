import { Log } from "antelopejs-module/dist/interfaces/template-module/beta";

export function construct(): void {}

export async function start(): Promise<void> {
  await Log("Hello world");
}

export function destroy(): void {}

export function stop(): void {}
