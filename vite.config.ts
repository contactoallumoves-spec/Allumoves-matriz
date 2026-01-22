// vite.config.ts  (REEMPLAZAR COMPLETO)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

function ghPagesBase(): string {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  return repo ? `/${repo}/` : "/";
}

export default defineConfig({
  base: ghPagesBase(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "All U Moves — Matriz Maestra",
        short_name: "Matriz AUM",
        description: "Dashboard premium para matriz de ejercicios, microciclos y resumen de carga.",
        theme_color: "#102024",
        background_color: "#F5EFE5",
        display: "standalone",
        scope: ghPagesBase(),
        start_url: ghPagesBase(),
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
