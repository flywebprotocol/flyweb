import type { FlyWebConfig } from 'flyweb';
import { validate } from 'flyweb';

/**
 * Creates a Next.js App Router handler that serves your flyweb.json.
 *
 * @example
 * ```ts
 * // app/.well-known/flyweb.json/route.ts
 * import { createHandler } from 'next-flyweb';
 *
 * export const GET = createHandler({
 *   flyweb: '1.0',
 *   entity: 'My Blog',
 *   type: 'blog',
 *   resources: {
 *     posts: {
 *       path: '/.flyweb/posts',
 *       format: 'jsonl',
 *       fields: ['title', 'author', 'date', 'content'],
 *     },
 *   },
 * });
 * ```
 */
export function createHandler(config: FlyWebConfig) {
  const result = validate(config);
  if (!result.valid) {
    console.warn('[next-flyweb] Config validation errors:', result.errors);
  }

  const body = JSON.stringify(config, null, 2);

  return function GET() {
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
        'X-FlyWeb-Version': '1.0',
      },
    });
  };
}
