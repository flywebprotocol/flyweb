import type { FlyWebConfig, FlyWebResource } from './types.js';
import { validate } from './validate.js';

export interface DiscoverResult {
  /** The discovered FlyWeb config */
  config: FlyWebConfig;
  /** The URL where the config was found */
  url: string;
}

export interface FetchResourceOptions {
  /** Query parameters to pass */
  params?: Record<string, string>;
  /** Max number of items (sets limit param) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Discover a site's FlyWeb config by fetching /.well-known/flyweb.json.
 *
 * @example
 * ```ts
 * import { discover } from 'flyweb/client';
 *
 * const site = await discover('https://example.com');
 * console.log(site.config.entity);
 * console.log(Object.keys(site.config.resources));
 * ```
 */
export async function discover(baseUrl: string): Promise<DiscoverResult> {
  const base = baseUrl.replace(/\/$/, '');
  const flywebUrl = `${base}/.well-known/flyweb.json`;

  const response = await fetch(flywebUrl, {
    headers: { Accept: 'application/json', 'User-Agent': 'flyweb-client/1.0' },
  });

  if (!response.ok) {
    throw new Error(`No FlyWeb config found at ${flywebUrl} (HTTP ${response.status})`);
  }

  const config = (await response.json()) as FlyWebConfig;
  const result = validate(config);

  if (!result.valid) {
    throw new Error(`Invalid FlyWeb config at ${flywebUrl}: ${result.errors.join(', ')}`);
  }

  return { config, url: flywebUrl };
}

/**
 * Fetch structured data from a FlyWeb resource endpoint.
 *
 * @example
 * ```ts
 * import { discover, fetchResource } from 'flyweb/client';
 *
 * const site = await discover('https://example.com');
 * const posts = await fetchResource(
 *   'https://example.com',
 *   site.config.resources.posts,
 *   { params: { tag: 'ai' }, limit: 10 }
 * );
 * ```
 */
export async function fetchResource<T = Record<string, unknown>>(
  baseUrl: string,
  resource: FlyWebResource,
  options?: FetchResourceOptions,
): Promise<T[]> {
  const base = baseUrl.replace(/\/$/, '');
  const url = new URL(`${base}${resource.path}`);

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }
  if (options?.limit) {
    url.searchParams.set('limit', String(options.limit));
  }
  if (options?.offset) {
    url.searchParams.set('offset', String(options.offset));
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json', 'User-Agent': 'flyweb-client/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch resource at ${url} (HTTP ${response.status})`);
  }

  const text = await response.text();

  if (resource.format === 'jsonl') {
    return text
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as T);
  }

  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? (parsed as T[]) : [parsed as T];
}
