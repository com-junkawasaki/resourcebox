// JSON-LD exporters for ontology constructs (structural only)

import type {
  Annotation,
  ClassExpression,
  OntoClass,
  OntoDatatype,
  OntoIRI,
  OntoProperty,
  Ontology,
  Restriction,
} from "./types.js";

import { OWL, RDF, RDFS } from "./namespace.js";
import { getIRI } from "./types.js";

export function toJsonLd(ontology: Ontology): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [];

  // Ontology header
  const ontoNode: Record<string, unknown> = {
    "@id": ontology.iri,
    "@type": OWL("Ontology"),
  };
  if (ontology.imports && ontology.imports.length > 0) {
    ontoNode[OWL("imports")] = ontology.imports;
  }
  if (ontology.annotations) {
    for (const ann of ontology.annotations) {
      addAnnotation(ontoNode, ann);
    }
  }
  graph.push(ontoNode);

  // Classes
  if (ontology.classes) {
    for (const cls of ontology.classes) {
      graph.push(classToNode(cls));
    }
  }

  // Properties
  if (ontology.properties) {
    for (const prop of ontology.properties) {
      graph.push(propertyToNode(prop));
    }
  }

  return {
    "@context": {
      rdf: RDF.uri,
      rdfs: RDFS.uri,
      owl: OWL.uri,
    },
    "@graph": graph,
  };
}

function classToNode(cls: OntoClass): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@id": getIRI(cls),
    "@type": OWL("Class"),
  };
  if (cls.label) node[RDFS("label")] = cls.label;
  if (cls.comment) node[RDFS("comment")] = cls.comment;
  if (cls.subClassOf && cls.subClassOf.length > 0) {
    node[RDFS("subClassOf")] = cls.subClassOf.map(getIRI);
  }
  if (cls.disjointWith && cls.disjointWith.length > 0) {
    node[OWL("disjointWith")] = cls.disjointWith.map(getIRI);
  }
  if (cls.equivalentClass && cls.equivalentClass.length > 0) {
    node[OWL("equivalentClass")] = cls.equivalentClass.map(expressionToValue);
  }
  if (cls.annotations) {
    for (const ann of cls.annotations) addAnnotation(node, ann);
  }
  return node;
}

function propertyToNode(prop: OntoProperty): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@id": getIRI(prop),
    "@type": RDF("Property"),
  };
  if (prop.label) node[RDFS("label")] = prop.label;
  if (prop.comment) node[RDFS("comment")] = prop.comment;
  if (prop.domain && prop.domain.length > 0) node[RDFS("domain")] = prop.domain.map(getIRI);
  if (prop.range && prop.range.length > 0) node[RDFS("range")] = prop.range.map(getIRI);
  if (prop.subPropertyOf && prop.subPropertyOf.length > 0) {
    node[RDFS("subPropertyOf")] = prop.subPropertyOf.map(getIRI);
  }
  if (prop.inverseOf) node[OWL("inverseOf")] = getIRI(prop.inverseOf);
  if (prop.functional) node["@type"] = [RDF("Property"), OWL("FunctionalProperty")];
  if (prop.inverseFunctional) {
    const types = node["@type"] as string[] | undefined;
    node["@type"] = [...(types ?? [RDF("Property")]), OWL("InverseFunctionalProperty")];
  }
  if (prop.transitive) {
    const types = node["@type"] as string[] | undefined;
    node["@type"] = [...(types ?? [RDF("Property")]), OWL("TransitiveProperty")];
  }
  if (prop.symmetric) {
    const types = node["@type"] as string[] | undefined;
    node["@type"] = [...(types ?? [RDF("Property")]), OWL("SymmetricProperty")];
  }
  if (prop.asymmetric) {
    const types = node["@type"] as string[] | undefined;
    node["@type"] = [...(types ?? [RDF("Property")]), OWL("AsymmetricProperty")];
  }
  if (prop.reflexive) {
    const types = node["@type"] as string[] | undefined;
    node["@type"] = [...(types ?? [RDF("Property")]), OWL("ReflexiveProperty")];
  }
  if (prop.irreflexive) {
    const types = node["@type"] as string[] | undefined;
    node["@type"] = [...(types ?? [RDF("Property")]), OWL("IrreflexiveProperty")];
  }
  if (prop.equivalentProperty && prop.equivalentProperty.length > 0) {
    node[OWL("equivalentProperty")] = prop.equivalentProperty.map(getIRI);
  }
  if (prop.propertyChain && prop.propertyChain.length > 0) {
    node[OWL("propertyChainAxiom")] = toRdfList(prop.propertyChain.map(getIRI));
  }
  if (prop.annotations) for (const ann of prop.annotations) addAnnotation(node, ann);
  return node;
}

function expressionToValue(expr: OntoIRI | OntoClass | ClassExpression): unknown {
  if (typeof expr === "string") return expr;
  if ((expr as OntoClass).kind === "Class") return getIRI(expr as OntoClass);
  const ce = expr as ClassExpression;
  switch (ce.kind) {
    case "Union":
      return { [OWL("unionOf")]: toJsonLdList(ce.operands.map(expressionToValue)) };
    case "Intersection":
      return { [OWL("intersectionOf")]: toJsonLdList(ce.operands.map(expressionToValue)) };
    case "Complement":
      return { [OWL("complementOf")]: expressionToValue(ce.of) };
    case "OneOf":
      return { [OWL("oneOf")]: toJsonLdList(ce.individuals) };
    case "Restriction":
      return restrictionToNode(ce);
  }
}

function restrictionToNode(r: Restriction): Record<string, unknown> {
  const node: Record<string, unknown> = { "@type": OWL("Restriction"), [OWL("onProperty")]: getIRI(r.onProperty) };
  if (r.someValuesFrom) node[OWL("someValuesFrom")] = expressionToValue(r.someValuesFrom);
  if (r.allValuesFrom) node[OWL("allValuesFrom")] = expressionToValue(r.allValuesFrom);
  if (r.hasValue !== undefined) node[OWL("hasValue")] = r.hasValue;
  if (r.minQualifiedCardinality !== undefined)
    node[OWL("minQualifiedCardinality")] = r.minQualifiedCardinality;
  if (r.maxQualifiedCardinality !== undefined)
    node[OWL("maxQualifiedCardinality")] = r.maxQualifiedCardinality;
  if (r.qualifiedCardinality !== undefined) node[OWL("qualifiedCardinality")] = r.qualifiedCardinality;
  if (r.minCardinality !== undefined) node[OWL("minCardinality")] = r.minCardinality;
  if (r.maxCardinality !== undefined) node[OWL("maxCardinality")] = r.maxCardinality;
  if (r.cardinality !== undefined) node[OWL("cardinality")] = r.cardinality;
  if (r.onClass) node[OWL("onClass")] = expressionToValue(r.onClass);
  if (r.onDatatype) node[OWL("onDataRange")] = r.onDatatype;
  return node;
}

// JSON-LD representation of RDF list: nested objects with rdf:first/rest ... rdf:nil
function toRdfList(items: ReadonlyArray<OntoIRI>): unknown {
  if (items.length === 0) return RDF("nil");
  const head = { [RDF("first")]: items[0] } as Record<string, unknown>;
  let cursor = head;
  for (let i = 1; i < items.length; i++) {
    const next = { [RDF("first")]: items[i] } as Record<string, unknown>;
    cursor[RDF("rest")] = next;
    cursor = next;
  }
  cursor[RDF("rest")] = RDF("nil");
  return head;
}

function addAnnotation(node: Record<string, unknown>, ann: Annotation): void {
  node[ann.property] = ann.value as unknown;
}

function toJsonLdList(items: ReadonlyArray<unknown>): { "@list": ReadonlyArray<unknown> } {
  return { "@list": items };
}


