import { defineConfig } from "@antelopejs/interface-core/config";

export default defineConfig({
  name: "antelopejs-module-test",
  modules: {
    "antelopejs-module": {
      source: {
        type: "local",
        path: ".",
        installCommand: ["node node_modules/typescript/bin/tsc --skipLibCheck"],
      },
    },
  },
  test: {
    folder: "test",
  },
});
