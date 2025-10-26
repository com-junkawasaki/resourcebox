// DAG: process-rpc
// RPC integration helpers derived from JSON-LD contexts

export type { RpcTermKind } from "./context-types.js";

export { expandContextValue, expandContextMap } from "./context-types.js";

export { importContextFromRdfXml, importContextFromStream } from "../importers/index.js";
