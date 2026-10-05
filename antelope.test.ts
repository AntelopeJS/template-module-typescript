import { defineConfig } from "@antelopejs/interface-core/config";

export default defineConfig({
  name: "antelopejs-module-test",
  modules: {
    "antelopejs-module": {
      source: {
        type: "local",
        path: ".",
        installCommand: ["npx tsc"],
      },
    },
  },
  test: {
    folder: "test",
  },
});
