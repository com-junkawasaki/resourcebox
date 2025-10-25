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
    ontoNode["owl:imports"] = ontology.imports;
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
  if (cls.label) node["rdfs:label"] = cls.label;
  if (cls.comment) node["rdfs:comment"] = cls.comment;
  if (cls.subClassOf && cls.subClassOf.length > 0) {
    node["rdfs:subClassOf"] = cls.subClassOf.map(getIRI);
  }
  if (cls.disjointWith && cls.disjointWith.length > 0) {
    node["owl:disjointWith"] = cls.disjointWith.map(getIRI);
  }
  if (cls.equivalentClass && cls.equivalentClass.length > 0) {
    node["owl:equivalentClass"] = cls.equivalentClass.map(expressionToValue);
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
  if (prop.label) node["rdfs:label"] = prop.label;
  if (prop.comment) node["rdfs:comment"] = prop.comment;
  if (prop.domain && prop.domain.length > 0) node["rdfs:domain"] = prop.domain.map(getIRI);
  if (prop.range && prop.range.length > 0) node["rdfs:range"] = prop.range.map(getIRI);
  if (prop.subPropertyOf && prop.subPropertyOf.length > 0) {
    node["rdfs:subPropertyOf"] = prop.subPropertyOf.map(getIRI);
  }
  if (prop.inverseOf) node["owl:inverseOf"] = getIRI(prop.inverseOf);
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
    node["owl:equivalentProperty"] = prop.equivalentProperty.map(getIRI);
  }
  if (prop.propertyChain && prop.propertyChain.length > 0) {
    node["owl:propertyChainAxiom"] = toRdfList(prop.propertyChain.map(getIRI));
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
      return { ["owl:unionOf"]: toJsonLdList(ce.operands.map(expressionToValue)) };
    case "Intersection":
      return { ["owl:intersectionOf"]: toJsonLdList(ce.operands.map(expressionToValue)) };
    case "Complement":
      return { ["owl:complementOf"]: expressionToValue(ce.of) };
    case "OneOf":
      return { ["owl:oneOf"]: toJsonLdList(ce.individuals) };
    case "Restriction":
      return restrictionToNode(ce);
  }
}

function restrictionToNode(r: Restriction): Record<string, unknown> {
  const node: Record<string, unknown> = { "@type": OWL("Restriction"), ["owl:onProperty"]: getIRI(r.onProperty) };
  if (r.someValuesFrom) node["owl:someValuesFrom"] = expressionToValue(r.someValuesFrom);
  if (r.allValuesFrom) node["owl:allValuesFrom"] = expressionToValue(r.allValuesFrom);
  if (r.hasValue !== undefined) node["owl:hasValue"] = r.hasValue;
  if (r.minQualifiedCardinality !== undefined)
    node["owl:minQualifiedCardinality"] = r.minQualifiedCardinality;
  if (r.maxQualifiedCardinality !== undefined)
    node["owl:maxQualifiedCardinality"] = r.maxQualifiedCardinality;
  if (r.qualifiedCardinality !== undefined) node["owl:qualifiedCardinality"] = r.qualifiedCardinality;
  if (r.minCardinality !== undefined) node["owl:minCardinality"] = r.minCardinality;
  if (r.maxCardinality !== undefined) node["owl:maxCardinality"] = r.maxCardinality;
  if (r.cardinality !== undefined) node["owl:cardinality"] = r.cardinality;
  if (r.onClass) node["owl:onClass"] = expressionToValue(r.onClass);
  if (r.onDatatype) node["owl:onDataRange"] = r.onDatatype;
  return node;
}

// JSON-LD representation of RDF list: nested objects with rdf:first/rest ... rdf:nil
function toRdfList(items: ReadonlyArray<OntoIRI>): unknown {
  if (items.length === 0) return "rdf:nil";
  const head = { ["rdf:first"]: items[0] } as Record<string, unknown>;
  let cursor = head;
  for (let i = 1; i < items.length; i++) {
    const next = { ["rdf:first"]: items[i] } as Record<string, unknown>;
    cursor["rdf:rest"] = next;
    cursor = next;
  }
  cursor["rdf:rest"] = "rdf:nil";
  return head;
}

function addAnnotation(node: Record<string, unknown>, ann: Annotation): void {
  node[ann.property] = ann.value as unknown;
}

function toJsonLdList(items: ReadonlyArray<unknown>): { "@list": ReadonlyArray<unknown> } {
  return { "@list": items };
}


