# Comunica SPARQL Examples

Query RDF stores with Comunica. Supports Amazon Neptune, Stardog, Ontotext GraphDB, Apache Jena Fuseki, SAP HANA, Oracle RDF, etc.

## Structure
- `select.js`, `construct.js` — Comunica queries
- `update.js` — SPARQL Update (undici)
- `.env` — endpoint & optional Basic auth
- `docker-compose.yml` — local Jena Fuseki

## Quick Start

```bash
cd examples/comunica-sparql
pnpm i
cp .env.example .env
pnpm fuseki        # start Fuseki on 3030
pnpm update        # insert sample triples
pnpm select
pnpm construct
pnpm fuseki:down
```

## Provider-specific notes

### Amazon Neptune
- Require VPC access + SigV4 signing (see `examples/neptune-vpc-proxy/README.md`)
- Use AWS CLI (`aws neptune-db execute-sparql`) or sign requests manually
- Set `SPARQL_ENDPOINT=https://.../sparql`, no Basic auth

### Stardog
- Supports Basic auth (see `examples/stardog-basic-auth`)
- `.env`: `SPARQL_USER`, `SPARQL_PASSWORD`
- Update endpoint: `/update`

### GraphDB
- Public demo endpoints (read-only) — see `examples/graphdb-public`
- No auth, just set `SPARQL_ENDPOINT`

### Apache Jena Fuseki
- Provided via docker-compose, open by default
- For secured deployments, configure Basic auth similar to Stardog

### SAP HANA / Oracle RDF
- Typically require Basic or SAML-based auth; adapt header generation in `src/util.js`
- Ensure TLS and network connectivity

## Environment variables

```
SPARQL_ENDPOINT=http://localhost:3030/ds/sparql
SPARQL_UPDATE_ENDPOINT=http://localhost:3030/ds/update
SPARQL_USER=
SPARQL_PASSWORD=
```

Modify `src/util.js` for custom headers (e.g., API Keys, Bearer tokens).
