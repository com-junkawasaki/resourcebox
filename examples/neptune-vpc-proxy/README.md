# Amazon Neptune (VPC) SPARQL Client

Complete Node.js client for querying Amazon Neptune with IAM authentication and SigV4 signing.

## Features

- **Automatic SigV4 signing** for IAM-authenticated Neptune clusters
- **SPARQL SELECT/UPDATE** support
- **VPC access** ready (works with bastion hosts, VPN, etc.)
- **AWS SDK integration** for credential management

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp env-example.txt .env
   # Edit .env with your Neptune endpoint and AWS credentials
   ```

3. **Ensure network access:**
   - EC2 bastion / Systems Manager Session Manager
   - AWS VPN / Direct Connect
   - VPC Endpoint Service + PrivateLink

## Usage

### Query (SELECT)

```bash
node query.js https://your-cluster.cluster-xyz.region.neptune.amazonaws.com:8182 your-database
```

Or with environment variables:

```bash
export NEPTUNE_ENDPOINT=https://your-cluster.cluster-xyz.region.neptune.amazonaws.com:8182
export NEPTUNE_DATABASE=your-database
node query.js
```

### Update (INSERT/DELETE)

```bash
node update.js
```

### Programmatic usage

```javascript
const { NeptuneClient } = require('./neptune-client');

const client = new NeptuneClient({
  endpoint: 'https://your-cluster.cluster-xyz.region.neptune.amazonaws.com:8182',
  database: 'your-database',
  region: 'us-east-1',
});

const result = await client.query('SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5');
console.log(result);
```

## Authentication

Uses IAM SigV4 signing automatically. Credentials are resolved in this order:

1. Explicit credentials in constructor
2. AWS CLI configuration (`~/.aws/credentials`)
3. Environment variables (`AWS_ACCESS_KEY_ID`, etc.)
4. EC2 instance profile / ECS task role

## Alternative: AWS CLI

For simple queries, you can also use the AWS CLI:

```bash
aws neptune-db execute-sparql \
  --resource-arn arn:aws:neptune-db:REGION:ACCOUNT:cluster:CLUSTER-ID \
  --endpoint https://your-cluster.cluster-xyz.amazonaws.com:8182/sparql \
  --database yourdb \
  --query 'SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5'
```
