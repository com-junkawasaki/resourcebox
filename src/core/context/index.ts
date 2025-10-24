// DAG: core-context
// Context generation export index

export type {
  JsonLdTermDefinition,
  JsonLdContextValue,
  JsonLdContextMap,
  JsonLdContext,
  BuildContextOptions,
} from "./types.js";

export {
  buildContext,
  mergeContexts,
  extractNamespacePrefixes,
} from "./build-context.js";
