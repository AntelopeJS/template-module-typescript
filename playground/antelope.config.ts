import { defineConfig } from "@antelopejs/interface-core/config";

export default defineConfig({
  name: "playground",
  modules: {
    playground: {
      source: {
        type: "local",
        path: ".",
        installCommand: ["npx tsc"],
      },
    },
    "antelopejs-module": {
      source: {
        type: "local",
        path: "..",
        installCommand: ["npx tsc"],
      },
    },
  },
});
