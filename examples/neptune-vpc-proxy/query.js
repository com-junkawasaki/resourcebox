#!/usr/bin/env node

/**
 * Neptune SPARQL query example
 * Usage: node query.js [endpoint] [database]
 */

const { NeptuneClient } = require("./neptune-client");

async function main() {
  const endpoint = process.argv[2] || process.env.NEPTUNE_ENDPOINT;
  const database = process.argv[3] || process.env.NEPTUNE_DATABASE;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!endpoint) {
    console.error("Usage: node query.js <endpoint> [database]");
    console.error("Or set NEPTUNE_ENDPOINT and optionally NEPTUNE_DATABASE env vars");
    process.exit(1);
  }

  const client = new NeptuneClient({
    endpoint,
    database,
    region,
  });

  try {
    console.log("Querying Neptune...");
    const result = await client.query(`
      SELECT ?s ?p ?o
      WHERE {
        ?s ?p ?o
      }
      LIMIT 10
    `);

    console.log("Results:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
