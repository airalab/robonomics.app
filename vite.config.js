import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020"
    }
  },
  build: {
    commonjsOptions: {
      ignore: ["node-fetch", "util"]
    },
    rollupOptions: {
      external: ["node-fetch"]
    }
  }
});
