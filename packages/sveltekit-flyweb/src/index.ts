import type { FlyWebConfig } from 'flyweb';
import { validate } from 'flyweb';

export type { FlyWebConfig } from 'flyweb';
export { defineConfig } from 'flyweb';

/**
 * Creates a SvelteKit request handler that serves flyweb.json.
 *
 * @example
 * ```ts
 * // src/routes/.well-known/flyweb.json/+server.ts
 * import { createHandler } from 'sveltekit-flyweb';
 *
 * export const GET = createHandler({
 *   flyweb: '1.0',
 *   entity: 'My Blog',
 *   type: 'blog',
 *   attribution: { required: true, license: 'CC-BY-4.0', must_link: true },
 *   resources: {
 *     posts: {
 *       path: '/.flyweb/posts',
 *       format: 'jsonl',
 *       fields: ['title', 'author', 'date', 'content'],
 *       access: 'free',
 *     },
 *   },
 * });
 * ```
 */
export function createHandler(config: FlyWebConfig) {
  const result = validate(config);
  if (!result.valid) {
    console.warn('[sveltekit-flyweb] Config validation errors:', result.errors);
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

export interface ResourceHandlerOptions<T> {
  format: 'json' | 'jsonl';
  source: () => T[] | Promise<T[]>;
  queryable?: string[];
  maxLimit?: number;
}

/**
 * Creates a SvelteKit request handler that serves structured resource data.
 *
 * @example
 * ```ts
 * // src/routes/.flyweb/posts/+server.ts
 * import { createResourceHandler } from 'sveltekit-flyweb';
 * import { getAllPosts } from '$lib/posts';
 *
 * export const GET = createResourceHandler({
 *   format: 'jsonl',
 *   source: getAllPosts,
 *   queryable: ['tag', 'author'],
 * });
 * ```
 */
export function createResourceHandler<T extends Record<string, unknown>>(
  options: ResourceHandlerOptions<T>,
) {
  const maxLimit = options.maxLimit ?? 100;

  return async function GET({ url }: { url: URL }) {
    let data = await options.source();

    if (options.queryable) {
      for (const field of options.queryable) {
        const value = url.searchParams.get(field);
        if (value === null) continue;
        data = data.filter((item) => {
          const fieldValue = item[field];
          if (Array.isArray(fieldValue)) return fieldValue.includes(value);
          return String(fieldValue) === value;
        });
      }
    }

    const offset = parseInt(url.searchParams.get('offset') ?? '', 10);
    if (offset > 0) data = data.slice(offset);

    const limit = parseInt(url.searchParams.get('limit') ?? '', 10);
    const effectiveLimit = limit > 0 ? Math.min(limit, maxLimit) : maxLimit;
    data = data.slice(0, effectiveLimit);

    const headers: Record<string, string> = {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'Access-Control-Allow-Origin': '*',
      'X-FlyWeb-Version': '1.0',
    };

    if (options.format === 'jsonl') {
      const body = data.map((item) => JSON.stringify(item)).join('\n');
      return new Response(body, {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
    });
  };
}
