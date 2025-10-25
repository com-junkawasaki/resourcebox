// JSON-LD exporter for SHACL shapes (structural only)

import { RDF, RDFS } from "../onto/namespace.js";
import type { ShapeNodeDef, ShapePropertyDef } from "./types.js";

export function toJsonLd(
  shape: ShapeNodeDef | ReadonlyArray<ShapeNodeDef>
): Record<string, unknown> {
  const shapes = Array.isArray(shape) ? shape : [shape];
  const graph: Record<string, unknown>[] = shapes.map(nodeToJson);
  return {
    "@context": {
      rdf: RDF.uri,
      rdfs: RDFS.uri,
      sh: "http://www.w3.org/ns/shacl#",
    },
    "@graph": graph,
  };
}

function nodeToJson(def: ShapeNodeDef): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@type": "sh:NodeShape",
    "sh:targetClass": typeof def.targetClass === "string" ? def.targetClass : def.targetClass.iri,
  };
  if (def.description) node[RDFS("comment")] = def.description;
  if (def.closed !== undefined) node["sh:closed"] = def.closed;
  if (def.ignoredProperties && def.ignoredProperties.length > 0)
    node["sh:ignoredProperties"] = def.ignoredProperties;

  const properties: Record<string, unknown>[] = [];
  for (const prop of Object.values(def.property)) properties.push(propertyToJson(prop));
  if (properties.length > 0) node["sh:property"] = properties;
  return node;
}

function propertyToJson(prop: ShapePropertyDef): Record<string, unknown> {
  const p: Record<string, unknown> = {
    "sh:path": typeof prop.path === "string" ? prop.path : prop.path.iri,
  };
  if (prop.datatype)
    p["sh:datatype"] = typeof prop.datatype === "string" ? prop.datatype : prop.datatype.iri;
  if (prop.class) p["sh:class"] = typeof prop.class === "string" ? prop.class : prop.class.iri;
  if (prop.minCount !== undefined) p["sh:minCount"] = prop.minCount;
  if (prop.maxCount !== undefined) p["sh:maxCount"] = prop.maxCount;
  if (prop.minLength !== undefined) p["sh:minLength"] = prop.minLength;
  if (prop.maxLength !== undefined) p["sh:maxLength"] = prop.maxLength;
  if (prop.pattern !== undefined) p["sh:pattern"] = prop.pattern;
  if (prop.minInclusive !== undefined) p["sh:minInclusive"] = prop.minInclusive;
  if (prop.maxInclusive !== undefined) p["sh:maxInclusive"] = prop.maxInclusive;
  if (prop.minExclusive !== undefined) p["sh:minExclusive"] = prop.minExclusive;
  if (prop.maxExclusive !== undefined) p["sh:maxExclusive"] = prop.maxExclusive;
  if (prop.nodeKind) p["sh:nodeKind"] = `sh:${prop.nodeKind}`;
  if (prop.in) p["sh:in"] = prop.in;
  if (prop.hasValue !== undefined) p["sh:hasValue"] = prop.hasValue;
  if (prop.propertyPath) p["sh:path"] = prop.propertyPath; // simple path override
  if (prop.or) p["sh:or"] = prop.or.map(propertyToJson);
  if (prop.xone) p["sh:xone"] = prop.xone.map(propertyToJson);
  if (prop.description) p[RDFS("comment")] = prop.description;
  return p;
}
