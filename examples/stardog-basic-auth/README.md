# Stardog + Comunica (Basic Auth)

This example shows how to run SPARQL queries against a Stardog instance that requires HTTP Basic authentication.

## Requirements
- Stardog server (cloud or on-prem)
- A database, user and password
- Node.js 20+

## Setup

```bash
cd examples/stardog-basic-auth
pnpm i
cp .env.example .env    # edit with your Stardog endpoint and credentials
```

`.env` values:
```
SPARQL_ENDPOINT=https://your-stardog-host:5820/your-db/query
SPARQL_USER=admin
SPARQL_PASSWORD=...
```

## Run

```bash
pnpm select    # run SELECT query via Comunica
pnpm construct # run CONSTRUCT query
pnpm update    # execute SPARQL Update via HTTP
```

> Note: Update endpoint is usually `${SPARQL_ENDPOINT.replace('/query', '/update')}`.
