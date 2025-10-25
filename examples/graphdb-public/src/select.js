import { newEngine } from "@comunica/query-sparql";
import { graphdbSources } from "./util.js";

const query = `
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}
LIMIT 10
`;

async function main() {
  const engine = newEngine();
  const sources = graphdbSources();
  const result = await engine.queryBindings(query, { sources });
  const rows = await result.toArray();
  for (const row of rows) {
    console.log(row.toObject());
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
