# Ontotext GraphDB + Comunica

Query the public GraphDB endpoints (no authentication) with Comunica.

## Setup

```bash
cd examples/graphdb-public
pnpm i
cp .env.example .env   # edit to choose endpoint
```

Example public endpoints:
- https://graphdb-demo.semwebcentral.org/repositories/restaurant
- https://graphdb.ontotext.com/repositories/sports

`.env` file:
```
SPARQL_ENDPOINT=https://graphdb-demo.semwebcentral.org/repositories/restaurant
```

## Run

```bash
pnpm select
pnpm construct
```

> No update example since public datasets are read-only.
