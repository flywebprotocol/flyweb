import type { FlyWebConfig, ResourceFormat } from './types.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_FORMATS: ResourceFormat[] = ['json', 'jsonl', 'csv', 'xml'];

/**
 * Validates a FlyWeb configuration object.
 * Returns { valid: true, errors: [] } if the config is valid,
 * or { valid: false, errors: [...] } with human-readable error messages.
 */
export function validate(config: unknown): ValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { valid: false, errors: ['Config must be a plain object'] };
  }

  const c = config as Record<string, unknown>;

  // flyweb version
  if (c.flyweb !== '1.0') {
    errors.push(`"flyweb" must be "1.0", got "${String(c.flyweb)}"`);
  }

  // entity
  if (!c.entity || typeof c.entity !== 'string') {
    errors.push('"entity" is required and must be a non-empty string');
  }

  // type
  if (!c.type || typeof c.type !== 'string') {
    errors.push('"type" is required and must be a non-empty string');
  }

  // description (optional)
  if (c.description !== undefined && typeof c.description !== 'string') {
    errors.push('"description" must be a string if provided');
  }

  // url (optional)
  if (c.url !== undefined && typeof c.url !== 'string') {
    errors.push('"url" must be a string if provided');
  }

  // resources
  if (!c.resources || typeof c.resources !== 'object' || Array.isArray(c.resources)) {
    errors.push('"resources" is required and must be an object');
  } else {
    const resources = c.resources as Record<string, unknown>;

    if (Object.keys(resources).length === 0) {
      errors.push('"resources" must contain at least one resource');
    }

    for (const [name, resource] of Object.entries(resources)) {
      validateResource(name, resource, errors);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateResource(name: string, resource: unknown, errors: string[]): void {
  const prefix = `resources.${name}`;

  if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
    errors.push(`${prefix}: must be an object`);
    return;
  }

  const r = resource as Record<string, unknown>;

  // path
  if (!r.path || typeof r.path !== 'string') {
    errors.push(`${prefix}.path: required, must be a non-empty string`);
  } else if (!r.path.startsWith('/')) {
    errors.push(`${prefix}.path: must start with "/"`);
  }

  // format
  if (!r.format || typeof r.format !== 'string') {
    errors.push(`${prefix}.format: required, must be one of ${VALID_FORMATS.join(', ')}`);
  } else if (!VALID_FORMATS.includes(r.format as ResourceFormat)) {
    errors.push(`${prefix}.format: must be one of ${VALID_FORMATS.join(', ')}, got "${r.format}"`);
  }

  // fields
  if (!Array.isArray(r.fields)) {
    errors.push(`${prefix}.fields: required, must be an array of strings`);
  } else if (r.fields.length === 0) {
    errors.push(`${prefix}.fields: must contain at least one field`);
  } else {
    for (let i = 0; i < r.fields.length; i++) {
      if (typeof r.fields[i] !== 'string') {
        errors.push(`${prefix}.fields[${i}]: must be a string`);
      }
    }
  }

  // query (optional)
  if (r.query !== undefined && typeof r.query !== 'string') {
    errors.push(`${prefix}.query: must be a string if provided`);
  }

  // description (optional)
  if (r.description !== undefined && typeof r.description !== 'string') {
    errors.push(`${prefix}.description: must be a string if provided`);
  }

  // auth (optional)
  if (r.auth !== undefined && typeof r.auth !== 'boolean') {
    errors.push(`${prefix}.auth: must be a boolean if provided`);
  }
}
