import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import svgr from "vite-plugin-svgr";
import webfontDownload from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig(() => {
  const apiProxyTarget =
    process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8005";

  return {
    plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    svgr(),
    webfontDownload(),
  ],
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/playlists": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/admin": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      exclude: ["@spotify-playlists/shared"],
    },
    define: {
      global: "globalThis",
    },
  };
});
