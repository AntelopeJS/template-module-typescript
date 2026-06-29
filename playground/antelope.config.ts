import { defineConfig } from "@antelopejs/interface-core/config";

export default defineConfig({
  name: "playground",
  modules: {
    playground: {
      source: {
        type: "local",
        path: ".",
        watchDir: ["src"],
        installCommand: ["npx tsc"],
        reloadCommand: ["npx tsc"],
      },
    },
    "antelopejs-module": {
      source: {
        type: "local",
        path: "..",
        watchDir: ["src"],
        installCommand: ["npx tsc"],
        reloadCommand: ["npx tsc"],
      },
    },
  },
});
