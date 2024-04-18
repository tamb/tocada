import Bun from "bun";
import { resolve } from "bun:path";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: resolve(__dirname, "./dist"),
  minify: true,
  sourcemap: "external"
});
