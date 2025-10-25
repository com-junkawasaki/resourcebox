# CLI Demo – ResourceBox + Comunica

This demo runs a small pipeline:
1. Define a Person resource with ResourceBox
2. Generate JSON-LD context and SHACL shape
3. Load data into a SPARQL endpoint (manual step)
4. Query via Comunica

## Setup

```bash
cd examples/cli-demo
pnpm i
cp .env.example .env   # set SPARQL endpoint for query step
```

## Generate artifacts

```bash
pnpm context   # writes dist/context.jsonld
pnpm shape     # writes dist/person.shape.json
```

Load sample data into your endpoint (e.g., using Fuseki or Stardog).

## Run query

```bash
pnpm query
```
