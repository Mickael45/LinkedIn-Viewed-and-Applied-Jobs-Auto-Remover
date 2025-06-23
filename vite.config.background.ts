import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
      },
      output: {
        entryFileNames: "background.js",
        inlineDynamicImports: true,
      },
    },
  },
});
