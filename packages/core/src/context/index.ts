// DAG: core-context
// Context generation export index

export type {
  JsonLdTermDefinition,
  JsonLdContextValue,
  JsonLdContextMap,
  JsonLdContext,
  BuildContextOptions,
} from "./types.ts";

export {
  buildContext,
  mergeContexts,
  extractNamespacePrefixes,
} from "./build-context.ts";

