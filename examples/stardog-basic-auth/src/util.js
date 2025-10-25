import 'dotenv/config';

export function stardogSources() {
  const endpoint = process.env.SPARQL_ENDPOINT;
  if (!endpoint) {
    throw new Error('SPARQL_ENDPOINT env is required');
  }
  const user = process.env.SPARQL_USER || '';
  const pass = process.env.SPARQL_PASSWORD || '';
  const headers = {};
  if (user && pass) {
    headers['Authorization'] = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
  }
  return [{ type: 'sparql', value: endpoint, headers }];
}

export function updateEndpoint() {
  return process.env.SPARQL_UPDATE_ENDPOINT || process.env.SPARQL_ENDPOINT || '';
}
