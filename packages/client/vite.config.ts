import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    svgr(),
  ],
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    exclude: ["@spotify-playlists/shared"],
  },
  define: {
    global: "globalThis",
  },
});
