import type { FlyWebConfig, FlyWebResource } from 'flyweb';
import { validate } from 'flyweb';

export type { FlyWebConfig } from 'flyweb';
export { defineConfig } from 'flyweb';

/** Standard Node.js-compatible request/response types */
interface IncomingMessage {
  url?: string;
  method?: string;
}

interface ServerResponse {
  writeHead(statusCode: number, headers?: Record<string, string>): void;
  end(body?: string): void;
  setHeader?(name: string, value: string): void;
}

type NextFunction = () => void;

const FLYWEB_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  'Access-Control-Allow-Origin': '*',
  'X-FlyWeb-Version': '1.0',
};

/**
 * Express/Connect middleware that serves flyweb.json at /.well-known/flyweb.json
 * and optionally handles resource endpoints.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { flyweb } from 'express-flyweb';
 *
 * const app = express();
 *
 * app.use(flyweb({
 *   flyweb: '1.0',
 *   entity: 'My API',
 *   type: 'api',
 *   attribution: { required: true, license: 'MIT', must_link: true },
 *   resources: {
 *     items: {
 *       path: '/.flyweb/items',
 *       format: 'json',
 *       fields: ['id', 'name', 'description'],
 *       access: 'free',
 *     },
 *   },
 * }));
 * ```
 */
export function flyweb(config: FlyWebConfig) {
  const result = validate(config);
  if (!result.valid) {
    console.warn('[express-flyweb] Config validation errors:', result.errors);
  }

  const body = JSON.stringify(config, null, 2);

  return function flywebMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next?: NextFunction,
  ): void {
    const url = req.url ?? '';

    if (url === '/.well-known/flyweb.json' || url === '/.well-known/flyweb.json/') {
      res.writeHead(200, FLYWEB_HEADERS);
      res.end(body);
      return;
    }

    if (next) next();
  };
}

export interface ResourceOptions<T> {
  format: 'json' | 'jsonl';
  source: () => T[] | Promise<T[]>;
  queryable?: string[];
  maxLimit?: number;
}

/**
 * Creates an Express route handler for serving structured resource data.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { createResourceHandler } from 'express-flyweb';
 *
 * const app = express();
 *
 * app.get('/.flyweb/items', createResourceHandler({
 *   format: 'json',
 *   source: () => getItems(),
 *   queryable: ['category', 'status'],
 * }));
 * ```
 */
export function createResourceHandler<T extends Record<string, unknown>>(
  options: ResourceOptions<T>,
) {
  const maxLimit = options.maxLimit ?? 100;

  return async function resourceHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');

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
      res.writeHead(200, { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8' });
      res.end(body);
      return;
    }

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };
}
