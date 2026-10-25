import { cpSync, readdirSync } from "node:fs";

// tsc solo emite JS y .d.ts: el CSS y los mp3 los copiamos a mano. Un paso más
// de build (bundler, plugin de assets) no compra nada para cinco archivos.
for (const file of readdirSync("src").filter((f) => f.endsWith(".css"))) {
  cpSync(`src/${file}`, `dist/${file}`);
}
cpSync("src/sfx", "dist/sfx", { recursive: true });
