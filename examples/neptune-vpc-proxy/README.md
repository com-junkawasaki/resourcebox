# Amazon Neptune (VPC) – Notes

Amazon Neptune runs inside an AWS VPC. To query it from local or CI you typically need:

1. **Network access**
   - EC2 bastion / Systems Manager Session Manager
   - AWS VPN / Direct Connect
   - VPC Endpoint Service + PrivateLink

2. **Authentication**
   - IAM SigV4 signed requests (for HTTPS in IAM auth mode)
   - Or allow anonymous (not recommended)

## Minimal curl example (SigV4)

Use `aws neptune-db execute-sparql` or sign requests manually:

```bash
aws neptune-db execute-sparql \
  --resource-arn arn:aws:neptune-db:REGION:ACCOUNT:cluster:CLUSTER-ID \
  --endpoint https://your-cluster.cluster-xyz.amazonaws.com:8182/sparql \
  --database yourdb \
  --query 'SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5'
```

For programmatic signing in Node.js, use `@aws-sdk/signature-v4` with `undici` or `axios`.
