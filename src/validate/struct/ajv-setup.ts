// DAG: validate-struct
// Ajv instance setup with formats

import Ajv from "ajv";
import addFormats from "ajv-formats";

/**
 * Create a configured Ajv instance for shapebox validation.
 *
 * This instance is configured with:
 * - Strict mode disabled (for flexibility with TypeBox schemas)
 * - All errors collection
 * - Format validation enabled (uri, email, date-time, etc.)
 *
 * @returns Configured Ajv instance
 */
export function createAjvInstance(): Ajv {
  const ajv = new Ajv({
    strict: false,
    allErrors: true,
    validateFormats: true,
    coerceTypes: false, // Strict type checking
  });

  // Add format validators (email, uri, date-time, etc.)
  addFormats(ajv);

  return ajv;
}

/**
 * Singleton Ajv instance for reuse.
 * This avoids recreating the instance for every validation.
 */
let ajvInstance: Ajv | undefined;

/**
 * Get the shared Ajv instance.
 * Creates it on first call, then returns the cached instance.
 *
 * @returns Ajv instance
 */
export function getAjvInstance(): Ajv {
  if (!ajvInstance) {
    ajvInstance = createAjvInstance();
  }
  return ajvInstance;
}
