import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Solo para la página de demo: el paquete se compila con tsc, sin bundler.
export default defineConfig({
  root: "demo",
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5174 },
  build: { outDir: "../dist-demo", emptyOutDir: true },
});
