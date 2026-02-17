export type {
  FlyWebConfig,
  FlyWebResource,
  EntityType,
  ResourceFormat,
} from './types.js';

export { validate } from './validate.js';
export type { ValidationResult } from './validate.js';

/**
 * Helper for type-safe FlyWeb configuration.
 * Provides IDE autocompletion without runtime overhead.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'flyweb';
 *
 * export default defineConfig({
 *   flyweb: '1.0',
 *   entity: 'My Blog',
 *   type: 'blog',
 *   resources: {
 *     posts: {
 *       path: '/.flyweb/posts',
 *       format: 'jsonl',
 *       fields: ['title', 'author', 'date', 'content'],
 *       query: '?tag={tag}',
 *     },
 *   },
 * });
 * ```
 */
export function defineConfig(config: import('./types.js').FlyWebConfig): import('./types.js').FlyWebConfig {
  return config;
}
