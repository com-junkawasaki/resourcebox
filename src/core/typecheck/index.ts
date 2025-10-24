// DAG: core-typecheck
// Type-level integrity checks export index

export type {
  ValidateCardinalityOptional,
  ValidateAllCardinalityOptional,
  CardinalityOptionalError,
} from "./cardinality-optional.js";

export type { ValidateRangeExclusivity } from "./range-exclusivity.js";
export { validateRangeExclusivityRuntime } from "./range-exclusivity.js";

export type {
  ValidateExtendsCircular,
  ExtendsCircularError,
} from "./extends-circular.js";
export { validateExtendsCircularRuntime } from "./extends-circular.js";

export type {
  ValidatePropsSchemaConsistency,
  ExtraPropsKeys,
  PropsSchemaConsistencyError,
} from "./props-schema-consistency.js";
export { validatePropsSchemaConsistencyRuntime } from "./props-schema-consistency.js";
