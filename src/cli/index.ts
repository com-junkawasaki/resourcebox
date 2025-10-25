#!/usr/bin/env node
import { Command } from 'commander';
import { Resource, Shape } from '../index.js';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

const program = new Command();
program
  .name('resourcebox')
  .description('ResourceBox CLI utilities')
  .version('0.2.0');

async function loadModule(path: string) {
  const mod = await import(resolve(path));
  if (!mod.default) {
    throw new Error('Module must export default Resource schema');
  }
  return mod.default;
}

program
  .command('context <module>')
  .description('Generate JSON-LD context from a Resource module (default export)')
  .option('-o, --out <file>', 'Output file', 'context.jsonld')
  .action(async (modulePath: string, options: { out: string }) => {
    const resource = await loadModule(modulePath);
    const ctx = Resource.context(resource, {
      includeNamespaces: true,
    });
    await fs.writeFile(options.out, JSON.stringify(ctx, null, 2));
    console.log(`Context written to ${options.out}`);
  });

program
  .command('shape <module>')
  .description('Generate SHACL shape from a Resource module (default export)')
  .option('-o, --out <file>', 'Output file', 'shape.json')
  .option('--strict', 'Use strict cardinality', false)
  .action(async (modulePath: string, options: { out: string; strict?: boolean }) => {
    const resource = await loadModule(modulePath);
    const shape = Shape.fromResource(resource, { strict: Boolean(options.strict) });
    await fs.writeFile(options.out, JSON.stringify(shape, null, 2));
    console.log(`Shape written to ${options.out}`);
  });

program.parseAsync(process.argv);
