import 'dotenv/config';

export function graphdbSources() {
  const endpoint = process.env.SPARQL_ENDPOINT || 'https://graphdb-demo.semwebcentral.org/repositories/restaurant';
  return [{ type: 'sparql', value: endpoint }];
}
