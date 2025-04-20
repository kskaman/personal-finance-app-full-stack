import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // run in pure Node mode without threads
    environment: "node",
    threads: false,
    // force Rollup to load its JS version instead of native
    deps: {
      inline: ["rollup"],
    },
  },
});
