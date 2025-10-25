import { Resource } from '@gftdcojp/resourcebox';
import { ensureDir, writeJSON } from 'fs-extra/esm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Person } from './model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

async function main() {
  await ensureDir(distDir);
  const ctx = Resource.context(Person, {
    includeNamespaces: true,
    namespaces: {
      foaf: 'http://xmlns.com/foaf/0.1/',
    },
  });
  await writeJSON(resolve(distDir, 'context.jsonld'), ctx, { spaces: 2 });
  console.log('Wrote dist/context.jsonld');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
