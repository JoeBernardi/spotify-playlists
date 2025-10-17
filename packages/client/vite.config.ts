import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webfontDownload from "vite-plugin-webfont-dl";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    svgr({
      svgrOptions: {
        exportType: "default",
      },
    }),
    webfontDownload(),
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
