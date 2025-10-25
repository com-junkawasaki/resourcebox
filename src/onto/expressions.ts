// OWL Class Expression builders (structural only, no reasoning)

import type { ClassExpression, OntoClass, OntoIRI, OntoProperty, Restriction } from "./types.js";

type CE = OntoIRI | OntoClass | ClassExpression;

export function Union(operands: ReadonlyArray<CE>): ClassExpression {
  return { kind: "Union", operands: [...operands] };
}

export function Intersection(operands: ReadonlyArray<CE>): ClassExpression {
  return { kind: "Intersection", operands: [...operands] };
}

export function Complement(of: CE): ClassExpression {
  return { kind: "Complement", of };
}

export function OneOf(individuals: ReadonlyArray<OntoIRI>): ClassExpression {
  return { kind: "OneOf", individuals: [...individuals] };
}

export function SomeValuesFrom(args: {
  readonly onProperty: OntoIRI | OntoProperty;
  readonly onClass: CE;
}): Restriction {
  return {
    kind: "Restriction",
    onProperty: args.onProperty,
    someValuesFrom: args.onClass,
  };
}

export function AllValuesFrom(args: {
  readonly onProperty: OntoIRI | OntoProperty;
  readonly onClass: CE;
}): Restriction {
  return {
    kind: "Restriction",
    onProperty: args.onProperty,
    allValuesFrom: args.onClass,
  };
}

export function HasValue(args: {
  readonly onProperty: OntoIRI | OntoProperty;
  readonly value: string | number | boolean | OntoIRI;
}): Restriction {
  return {
    kind: "Restriction",
    onProperty: args.onProperty,
    hasValue: args.value,
  };
}

export function MinQualifiedCardinality(args: {
  readonly onProperty: OntoIRI | OntoProperty;
  readonly min: number;
  readonly onClass?: CE;
  readonly onDatatype?: OntoIRI;
}): Restriction {
  return {
    kind: "Restriction",
    onProperty: args.onProperty,
    minQualifiedCardinality: args.min,
    ...(args.onClass !== undefined && { onClass: args.onClass }),
    ...(args.onDatatype !== undefined && { onDatatype: args.onDatatype }),
  };
}

export function MaxQualifiedCardinality(args: {
  readonly onProperty: OntoIRI | OntoProperty;
  readonly max: number;
  readonly onClass?: CE;
  readonly onDatatype?: OntoIRI;
}): Restriction {
  return {
    kind: "Restriction",
    onProperty: args.onProperty,
    maxQualifiedCardinality: args.max,
    ...(args.onClass !== undefined && { onClass: args.onClass }),
    ...(args.onDatatype !== undefined && { onDatatype: args.onDatatype }),
  };
}

export function QualifiedCardinality(args: {
  readonly onProperty: OntoIRI | OntoProperty;
  readonly exact: number;
  readonly onClass?: CE;
  readonly onDatatype?: OntoIRI;
}): Restriction {
  return {
    kind: "Restriction",
    onProperty: args.onProperty,
    qualifiedCardinality: args.exact,
    ...(args.onClass !== undefined && { onClass: args.onClass }),
    ...(args.onDatatype !== undefined && { onDatatype: args.onDatatype }),
  };
}


