/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      /**
       * Specifies the coverage provider.
       * Vitest supports native code coverage via v8 and instrumented code
       *   coverage via istanbul.
       */
      provider: "v8",

      /**
       * Include patterns for files to include in coverage.
       */
      include: ["src/**/*.ts"],

      /**
       * Format(s) of the coverage reports to generate.
       * - 'text': prints a coverage summary to the terminal
       * - 'cobertura': produces an XML file (cobertura-coverage.xml)
       * - 'lcov': produces an LCOV file (lcov.info)
       */
      reporter: ["text"],

      /**
       * Where to place coverage output files
       */
      //reportsDirectory: "./coverage",

      /**
       * Additional configuration options for c8 can go here
       * (e.g., exclude patterns)
       */
    },
  },
  plugins: [react()],
  server: {
    hmr: {
      host: "localhost",
      clientPort: 5173,
    },
  },
});
