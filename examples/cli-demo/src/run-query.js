import "dotenv/config";
import { newEngine } from "@comunica/query-sparql";
import { Resource } from "@gftdcojp/resourcebox";
import { Person } from "./model.js";

const query = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?person ?name ?email
WHERE {
  ?person foaf:name ?name .
  OPTIONAL { ?person foaf:mbox ?email }
}
LIMIT 10
`;

async function main() {
  const endpoint = process.env.SPARQL_ENDPOINT || "http://localhost:3030/ds/sparql";
  const sources = [{ type: "sparql", value: endpoint }];

  const engine = newEngine();
  const result = await engine.queryBindings(query, { sources });
  const rows = await result.toArray();
  console.log("Results:\n");
  for (const row of rows) {
    const obj = row.toObject();
    console.log({
      person: obj.get("person")?.value,
      name: obj.get("name")?.value,
      email: obj.get("email")?.value,
    });
  }

  console.log("\nJSON-LD context (from ResourceBox):");
  console.log(JSON.stringify(Resource.context(Person), null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
