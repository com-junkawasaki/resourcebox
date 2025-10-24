// Shape.validate - Validate data against SHACL shape

import { getClassIRI, isClass } from "../onto/class.js";
import type { ShapeNodeDef, ShapeValidationResult, ShapeViolation } from "./types.js";

/**
 * Validate data against SHACL shape
 * Checks semantic constraints (SHACL)
 * 
 * @example
 * ```ts
 * const result = Shape.validate(PersonShape, data)
 * if (!result.ok) {
 *   console.error(result.violations)
 * }
 * ```
 */
export function validate(shape: ShapeNodeDef, data: unknown): ShapeValidationResult {
  const violations: ShapeViolation[] = [];
  
  // Data must be an object
  if (typeof data !== "object" || data === null) {
    return {
      ok: false,
      violations: [
        {
          path: "/",
          message: "Data must be an object",
          value: data,
          constraint: "type",
        },
      ],
    };
  }
  
  const dataObj = data as Record<string, unknown>;
  
  // Check target class (if @type exists)
  if ("@type" in dataObj) {
    const targetClassIRI = isClass(shape.targetClass)
      ? getClassIRI(shape.targetClass)
      : shape.targetClass;
    
    const types = Array.isArray(dataObj["@type"]) ? dataObj["@type"] : [dataObj["@type"]];
    if (!types.includes(targetClassIRI)) {
      violations.push({
        path: "/@type",
        message: `Expected @type to include ${targetClassIRI}`,
        value: dataObj["@type"],
        constraint: "targetClass",
      });
    }
  }
  
  // Validate each property
  for (const [propKey, propShape] of Object.entries(shape.property)) {
    const value = dataObj[propKey];
    
    // Check minCount
    if (propShape.minCount !== undefined) {
      const count = value === undefined ? 0 : Array.isArray(value) ? value.length : 1;
      if (count < propShape.minCount) {
        violations.push({
          path: `/${propKey}`,
          message: `Expected at least ${propShape.minCount} value(s), got ${count}`,
          value,
          constraint: "minCount",
        });
      }
    }
    
    // Check maxCount
    if (propShape.maxCount !== undefined && value !== undefined) {
      const count = Array.isArray(value) ? value.length : 1;
      if (count > propShape.maxCount) {
        violations.push({
          path: `/${propKey}`,
          message: `Expected at most ${propShape.maxCount} value(s), got ${count}`,
          value,
          constraint: "maxCount",
        });
      }
    }
    
    // Skip further checks if value is undefined
    if (value === undefined) {
      continue;
    }
    
    // Check string constraints
    if (typeof value === "string") {
      if (propShape.minLength !== undefined && value.length < propShape.minLength) {
        violations.push({
          path: `/${propKey}`,
          message: `String length must be at least ${propShape.minLength}, got ${value.length}`,
          value,
          constraint: "minLength",
        });
      }
      
      if (propShape.maxLength !== undefined && value.length > propShape.maxLength) {
        violations.push({
          path: `/${propKey}`,
          message: `String length must be at most ${propShape.maxLength}, got ${value.length}`,
          value,
          constraint: "maxLength",
        });
      }
      
      if (propShape.pattern !== undefined) {
        const regex = new RegExp(propShape.pattern);
        if (!regex.test(value)) {
          violations.push({
            path: `/${propKey}`,
            message: `String must match pattern ${propShape.pattern}`,
            value,
            constraint: "pattern",
          });
        }
      }
    }
    
    // Check number constraints
    if (typeof value === "number") {
      if (propShape.minInclusive !== undefined && value < propShape.minInclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be >= ${propShape.minInclusive}, got ${value}`,
          value,
          constraint: "minInclusive",
        });
      }
      
      if (propShape.maxInclusive !== undefined && value > propShape.maxInclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be <= ${propShape.maxInclusive}, got ${value}`,
          value,
          constraint: "maxInclusive",
        });
      }
      
      if (propShape.minExclusive !== undefined && value <= propShape.minExclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be > ${propShape.minExclusive}, got ${value}`,
          value,
          constraint: "minExclusive",
        });
      }
      
      if (propShape.maxExclusive !== undefined && value >= propShape.maxExclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be < ${propShape.maxExclusive}, got ${value}`,
          value,
          constraint: "maxExclusive",
        });
      }
    }
  }
  
  return {
    ok: violations.length === 0,
    ...(violations.length > 0 && { violations }),
  };
}

/**
 * Check if data matches shape (boolean result)
 */
export function check(shape: ShapeNodeDef, data: unknown): boolean {
  const result = validate(shape, data);
  return result.ok;
}

