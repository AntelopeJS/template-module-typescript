import { Logging } from "@antelopejs/interface-core/logging";

export function Log(message: string) {
  Logging.Info(message);
  return Promise.resolve();
}
