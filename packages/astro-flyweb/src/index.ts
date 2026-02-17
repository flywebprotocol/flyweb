import type { AstroIntegration } from 'astro';
import type { FlyWebConfig } from 'flyweb';
import { validate } from 'flyweb';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type { FlyWebConfig } from 'flyweb';
export { defineConfig } from 'flyweb';

interface AstroFlyWebOptions extends Omit<FlyWebConfig, 'flyweb'> {
  /** Protocol version (default: "1.0") */
  version?: '1.0';
}

/**
 * Astro integration that auto-generates `/.well-known/flyweb.json`
 * during the build process.
 *
 * @example
 * ```ts
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config';
 * import flyweb from 'astro-flyweb';
 *
 * export default defineConfig({
 *   integrations: [
 *     flyweb({
 *       entity: 'My Docs',
 *       type: 'docs',
 *       resources: {
 *         pages: {
 *           path: '/.flyweb/pages',
 *           format: 'jsonl',
 *           fields: ['title', 'slug', 'content'],
 *         },
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export default function flywebIntegration(options: AstroFlyWebOptions): AstroIntegration {
  const config: FlyWebConfig = {
    flyweb: options.version ?? '1.0',
    entity: options.entity,
    type: options.type,
    ...(options.description && { description: options.description }),
    ...(options.url && { url: options.url }),
    resources: options.resources,
  };

  const result = validate(config);
  if (!result.valid) {
    console.warn('[astro-flyweb] Config validation errors:', result.errors);
  }

  return {
    name: 'astro-flyweb',
    hooks: {
      'astro:config:setup': ({ config: astroConfig, logger }) => {
        // Write to public/.well-known/flyweb.json so it's served statically
        const publicDir =
          typeof astroConfig.publicDir === 'string'
            ? astroConfig.publicDir
            : astroConfig.publicDir.pathname.replace(/^\/([A-Z]:)/, '$1');

        const wellKnownDir = join(publicDir, '.well-known');
        const filePath = join(wellKnownDir, 'flyweb.json');

        if (!existsSync(wellKnownDir)) {
          mkdirSync(wellKnownDir, { recursive: true });
        }

        writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
        logger.info(`Generated ${filePath}`);
      },
    },
  };
}
