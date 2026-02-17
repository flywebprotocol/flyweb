import type { FlyWebConfig } from 'flyweb';
import { validate } from 'flyweb';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type { FlyWebConfig } from 'flyweb';
export { defineConfig } from 'flyweb';

interface NuxtFlyWebOptions extends Omit<FlyWebConfig, 'flyweb'> {
  /** Protocol version (default: "1.0") */
  version?: '1.0';
}

/**
 * Nuxt module that auto-generates `/.well-known/flyweb.json`
 * in the public directory during build.
 *
 * @example
 * ```ts
 * // nuxt.config.ts
 * import flyweb from 'nuxt-flyweb';
 *
 * export default defineNuxtConfig({
 *   modules: [
 *     [flyweb, {
 *       entity: 'My Site',
 *       type: 'blog',
 *       attribution: { required: true, license: 'CC-BY-4.0', must_link: true },
 *       resources: {
 *         posts: {
 *           path: '/.flyweb/posts',
 *           format: 'jsonl',
 *           fields: ['title', 'author', 'date', 'content'],
 *           access: 'free',
 *         },
 *       },
 *     }],
 *   ],
 * });
 * ```
 */
export default function flywebModule(options: NuxtFlyWebOptions, nuxt: any): void {
  const config: FlyWebConfig = {
    flyweb: options.version ?? '1.0',
    entity: options.entity,
    type: options.type,
    ...(options.description && { description: options.description }),
    ...(options.url && { url: options.url }),
    ...(options.attribution && { attribution: options.attribution }),
    resources: options.resources,
  };

  const result = validate(config);
  if (!result.valid) {
    console.warn('[nuxt-flyweb] Config validation errors:', result.errors);
  }

  // Write flyweb.json to the public directory
  const rootDir = nuxt?.options?.rootDir ?? process.cwd();
  const publicDir = join(rootDir, 'public');
  const wellKnownDir = join(publicDir, '.well-known');
  const filePath = join(wellKnownDir, 'flyweb.json');

  if (!existsSync(wellKnownDir)) {
    mkdirSync(wellKnownDir, { recursive: true });
  }

  writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`[nuxt-flyweb] Generated ${filePath}`);
}
