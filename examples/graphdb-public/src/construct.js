import { newEngine } from '@comunica/query-sparql';
import { graphdbSources } from './util.js';

const query = `
CONSTRUCT {
  ?s ?p ?o
}
WHERE {
  ?s ?p ?o
}
LIMIT 5
`;

async function main() {
  const engine = newEngine();
  const sources = graphdbSources();
  const result = await engine.queryQuads(query, { sources });
  const quads = await result.toArray();
  for (const quad of quads) {
    console.log(quad.subject.value, quad.predicate.value, quad.object.value);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
