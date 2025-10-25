import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Shape } from "@gftdcojp/resourcebox";
import { ensureDir, writeJSON } from "fs-extra/esm";
import { Person } from "./model.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

async function main() {
  await ensureDir(distDir);
  const shape = Shape.fromResource(Person, { strict: true });
  await writeJSON(resolve(distDir, "person.shape.json"), shape, { spaces: 2 });
  console.log("Wrote dist/person.shape.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
