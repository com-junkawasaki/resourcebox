import "dotenv/config";
import { request } from "undici";
import { updateEndpoint } from "./util.js";

const updateQuery = `
PREFIX ex: <http://example.org/>
INSERT DATA {
  ex:s1 ex:p1 ex:o1 .
}
`;

async function main() {
  const endpoint = updateEndpoint();
  if (!endpoint) {
    throw new Error("SPARQL_UPDATE_ENDPOINT or SPARQL_ENDPOINT must be set");
  }

  const body = new URLSearchParams();
  body.set("update", updateQuery);

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (process.env.SPARQL_USER && process.env.SPARQL_PASSWORD) {
    headers["Authorization"] =
      `Basic ${Buffer.from(`${process.env.SPARQL_USER}:${process.env.SPARQL_PASSWORD}`).toString("base64")}`;
  }

  const res = await request(endpoint, {
    method: "POST",
    headers,
    body,
  });

  console.log("Status:", res.statusCode);
  const text = await res.body.text();
  console.log(text || "OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
