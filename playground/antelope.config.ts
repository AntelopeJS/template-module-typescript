import { defineConfig } from "@antelopejs/interface-core/config";

export default defineConfig({
  name: "playground",
  modules: {
    playground: {
      source: {
        type: "local",
        path: ".",
        watchDir: ["src"],
        installCommand: ["node node_modules/typescript/bin/tsc"],
        reloadCommand: ["node node_modules/typescript/bin/tsc"],
      },
    },
    "antelopejs-module": {
      source: {
        type: "local",
        path: "..",
        watchDir: ["src"],
        installCommand: ["node node_modules/typescript/bin/tsc"],
        reloadCommand: ["node node_modules/typescript/bin/tsc"],
      },
    },
  },
});
