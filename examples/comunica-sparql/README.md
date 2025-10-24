# Comunica SPARQL Examples

This example shows how to query SPARQL endpoints (Neptune, Stardog, Ontotext GraphDB, Apache Jena Fuseki, SAP HANA, Oracle RDF) using Comunica.

- SELECT / CONSTRUCT queries
- SPARQL UPDATE
- Optional Basic Auth (via env)
- Local Jena Fuseki via Docker Compose

## Setup

```bash
cd examples/comunica-sparql
pnpm i
cp .env.example .env # then edit endpoints and credentials if needed
```

## Run local Fuseki (for quick try)

```bash
pnpm fuseki
# to stop
pnpm fuseki:down
```

## Run examples

```bash
pnpm select
pnpm construct
pnpm update
```

## Notes
- For Neptune or private endpoints, ensure network access and auth headers are configured.
- For Stardog, set SPARQL_USER / SPARQL_PASSWORD for Basic Auth.
