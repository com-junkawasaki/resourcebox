import { newEngine } from "@comunica/query-sparql";
import { endpointSources } from "./util.js";

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
  const sources = endpointSources();
  const result = await engine.queryQuads(query, { sources });
  const quads = await result.toArray();
  for (const q of quads) {
    console.log(q.subject.value, q.predicate.value, q.object.value);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
