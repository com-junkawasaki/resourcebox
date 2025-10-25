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

  const body = new URLSearchParams();
  body.set("update", updateQuery);

  const res = await request(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
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
