import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const index = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const js = index.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
const css = index.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];
if (!js || !css) throw new Error("Run npm run build first.");
const script = fs
  .readFileSync(path.join(root, "dist", js), "utf8")
  .replace(/<\/script/gi, "<\\/script");
const style = fs.readFileSync(path.join(root, "dist", css), "utf8");
const html = index
  .replace(
    /<script[^>]+src="[^"]+"[^>]*><\/script>/,
    () => `<script type="module">${script}</script>`,
  )
  .replace(
    /<link[^>]+href="[^"]+\.css"[^>]*>/,
    () => `<style>${style}</style>`,
  );
fs.writeFileSync(path.join(root, "Preview_Admin.html"), html);
console.log(
  "Created Preview_Admin.html: self-contained compiled React preview.",
);
