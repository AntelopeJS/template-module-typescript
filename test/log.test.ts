import assert from "node:assert";
import { Log } from "../dist/interfaces/template-module/beta/index.js";

describe("template-module beta", () => {
  it("logs a message through the module implementation", async () => {
    await assert.doesNotReject(Log("Hello from the tests"));
  });
});
