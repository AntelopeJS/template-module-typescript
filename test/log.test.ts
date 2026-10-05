import assert from "node:assert";
import { Log } from "antelopejs-module/dist/interfaces/template-module/beta";

describe("template-module beta", () => {
  it("logs a message through the module implementation", async () => {
    // Interface calls reject in tests unless a loaded module implements them.
    await assert.doesNotReject(Log("Hello from the tests"));
  });
});
