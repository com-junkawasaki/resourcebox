/**
 * Neptune SPARQL client with SigV4 signing for VPC access
 */

const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { Sha256 } = require("@aws-crypto/sha256-js");
const { fromIni, fromEnv } = require("@aws-sdk/credential-providers");
const { request } = require("undici");

/**
 * Neptune SPARQL client with automatic SigV4 signing
 */
class NeptuneClient {
  constructor(options = {}) {
    this.endpoint = options.endpoint;
    this.region = options.region || "us-east-1";
    this.database = options.database;
    this.credentials = options.credentials || fromIni() || fromEnv();

    this.signer = new SignatureV4({
      service: "neptune-db",
      region: this.region,
      credentials: this.credentials,
      sha256: Sha256,
    });
  }

  /**
   * Execute SPARQL SELECT query
   */
  async query(sparql, options = {}) {
    const url = new URL(this.endpoint);
    url.pathname = "/sparql";
    url.searchParams.set("query", sparql);

    if (this.database) {
      url.searchParams.set("database", this.database);
    }

    const requestOptions = {
      method: "GET",
      headers: {
        Accept: "application/sparql-results+json",
        ...options.headers,
      },
    };

    const signedRequest = await this.signer.sign({
      method: requestOptions.method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      protocol: url.protocol,
      headers: requestOptions.headers,
    });

    const response = await request(url.toString(), {
      method: signedRequest.method,
      headers: signedRequest.headers,
    });

    if (!response.statusCode || response.statusCode >= 400) {
      const body = await response.body.text();
      throw new Error(`Neptune query failed: ${response.statusCode} ${body}`);
    }

    return response.body.json();
  }

  /**
   * Execute SPARQL UPDATE query
   */
  async update(sparql, options = {}) {
    const url = new URL(this.endpoint);
    url.pathname = "/sparql";

    const body = new URLSearchParams();
    body.set("update", sparql);

    if (this.database) {
      body.set("database", this.database);
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
        ...options.headers,
      },
      body: body.toString(),
    };

    const signedRequest = await this.signer.sign({
      method: requestOptions.method,
      hostname: url.hostname,
      path: url.pathname,
      protocol: url.protocol,
      headers: requestOptions.headers,
      body: requestOptions.body,
    });

    const response = await request(url.toString(), {
      method: signedRequest.method,
      headers: signedRequest.headers,
      body: signedRequest.body,
    });

    if (!response.statusCode || response.statusCode >= 400) {
      const body = await response.body.text();
      throw new Error(`Neptune update failed: ${response.statusCode} ${body}`);
    }

    return response.body.json();
  }

  /**
   * Execute raw HTTP request with SigV4 signing
   */
  async request(path, options = {}) {
    const url = new URL(this.endpoint);
    url.pathname = path;

    const requestOptions = {
      method: options.method || "GET",
      headers: {
        ...options.headers,
      },
      ...(options.body && { body: options.body }),
    };

    const signedRequest = await this.signer.sign({
      method: requestOptions.method,
      hostname: url.hostname,
      path: url.pathname,
      protocol: url.protocol,
      headers: requestOptions.headers,
      ...(requestOptions.body && { body: requestOptions.body }),
    });

    const response = await request(url.toString(), {
      method: signedRequest.method,
      headers: signedRequest.headers,
      ...(signedRequest.body && { body: signedRequest.body }),
    });

    return {
      status: response.statusCode,
      headers: response.headers,
      body: response.body,
    };
  }
}

module.exports = { NeptuneClient };
