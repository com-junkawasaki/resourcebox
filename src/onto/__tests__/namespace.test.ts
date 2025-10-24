// Onto.Namespace tests

import { describe, expect, it } from "vitest";
import { Namespace, FOAF } from "../namespace.js";

describe("Onto.Namespace", () => {
  it("should create a namespace function", () => {
    const ex = Namespace({
      prefix: "ex",
      uri: "http://example.org/",
    });
    
    expect(ex.prefix).toBe("ex");
    expect(ex.uri).toBe("http://example.org/");
    expect(ex("Person")).toBe("http://example.org/Person");
  });
  
  it("should handle URI without trailing slash", () => {
    const ex = Namespace({
      prefix: "ex",
      uri: "http://example.org",
    });
    
    expect(ex.uri).toBe("http://example.org/");
    expect(ex("test")).toBe("http://example.org/test");
  });
  
  it("should provide common namespaces", () => {
    expect(FOAF.prefix).toBe("foaf");
    expect(FOAF("Person")).toContain("foaf");
  });
});

