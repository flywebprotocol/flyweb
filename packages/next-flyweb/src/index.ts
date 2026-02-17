export { createHandler } from './handler.js';
export { createResourceHandler } from './resource.js';
export type { ResourceHandlerOptions } from './resource.js';

// Re-export core types for convenience
export type {
  FlyWebConfig,
  FlyWebResource,
  EntityType,
  ResourceFormat,
} from 'flyweb';

export { defineConfig, validate } from 'flyweb';
