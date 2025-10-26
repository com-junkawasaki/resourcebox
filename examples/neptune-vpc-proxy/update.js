#!/usr/bin/env node

/**
 * Neptune SPARQL update example
 * Usage: node update.js [endpoint] [database]
 */

const { NeptuneClient } = require("./neptune-client");

async function main() {
  const endpoint = process.argv[2] || process.env.NEPTUNE_ENDPOINT;
  const database = process.argv[3] || process.env.NEPTUNE_DATABASE;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!endpoint) {
    console.error("Usage: node update.js <endpoint> [database]");
    console.error("Or set NEPTUNE_ENDPOINT and optionally NEPTUNE_DATABASE env vars");
    process.exit(1);
  }

  const client = new NeptuneClient({
    endpoint,
    database,
    region,
  });

  try {
    console.log("Updating Neptune...");
    const result = await client.update(`
      INSERT DATA {
        <http://example.org/test> <http://example.org/name> "Test Resource" .
        <http://example.org/test> <http://example.org/type> <http://example.org/TestType> .
      }
    `);

    console.log("Update completed:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Update failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
