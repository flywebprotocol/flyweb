/**
 * Creates a Next.js App Router handler that serves structured resource data.
 * Supports filtering by queryable fields, pagination with limit/offset.
 *
 * @example
 * ```ts
 * // app/.flyweb/posts/route.ts
 * import { createResourceHandler } from 'next-flyweb';
 * import { getAllPosts } from '@/lib/posts';
 *
 * export const GET = createResourceHandler({
 *   format: 'jsonl',
 *   source: getAllPosts,
 *   queryable: ['tag', 'author'],
 *   maxLimit: 50,
 * });
 * ```
 */

export interface ResourceHandlerOptions<T> {
  /** Data format to serve */
  format: 'json' | 'jsonl';

  /** Function that returns the data array */
  source: () => T[] | Promise<T[]>;

  /** Fields that can be filtered via query params */
  queryable?: string[];

  /** Max items per request (default: 100) */
  maxLimit?: number;
}

export function createResourceHandler<T extends Record<string, unknown>>(
  options: ResourceHandlerOptions<T>,
) {
  const maxLimit = options.maxLimit ?? 100;

  return async function GET(request: Request) {
    const url = new URL(request.url);

    let data = await options.source();

    // Filter by queryable fields
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

    // Pagination: offset
    const offset = parseInt(url.searchParams.get('offset') ?? '', 10);
    if (offset > 0) {
      data = data.slice(offset);
    }

    // Pagination: limit
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
