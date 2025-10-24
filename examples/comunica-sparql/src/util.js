import 'dotenv/config';

export function endpointSources() {
  const endpoint = process.env.SPARQL_ENDPOINT || 'http://localhost:3030/ds/sparql';
  const user = process.env.SPARQL_USER;
  const pass = process.env.SPARQL_PASSWORD;

  const headers = {};
  if (user && pass) {
    const token = Buffer.from(`${user}:${pass}`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }

  return [{ type: 'sparql', value: endpoint, headers }];
}

export function updateEndpoint() {
  return process.env.SPARQL_UPDATE_ENDPOINT || process.env.SPARQL_ENDPOINT || 'http://localhost:3030/ds/update';
}
