# FlyWeb

**Make the internet machine-readable.**

[![npm](https://img.shields.io/npm/v/flyweb)](https://www.npmjs.com/package/flyweb)
[![FlyWeb enabled](https://raw.githubusercontent.com/flywebprotocol/flyweb/master/badge.svg)](https://flyweb.io)

An open protocol that lets every website describe its content in a structured way machines can understand. One file. Universal discovery.

> `robots.txt` tells machines where **not** to go.
> `flyweb.json` tells them **what you have**.

## How It Works

Every website publishes `/.well-known/flyweb.json`:

```json
{
  "flyweb": "1.0",
  "entity": "TechCrunch",
  "type": "news",
  "resources": {
    "articles": {
      "path": "/.flyweb/articles",
      "format": "jsonl",
      "fields": ["title", "author", "date", "content"],
      "query": "?tag={tag}"
    }
  }
}
```

AI agents check this file first — no scraping, no guessing.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`flyweb`](./packages/flyweb) | Core types, validation, and CLI | [![npm](https://img.shields.io/npm/v/flyweb)](https://www.npmjs.com/package/flyweb) |
| [`next-flyweb`](./packages/next-flyweb) | Next.js integration | [![npm](https://img.shields.io/npm/v/next-flyweb)](https://www.npmjs.com/package/next-flyweb) |
| [`astro-flyweb`](./packages/astro-flyweb) | Astro integration | [![npm](https://img.shields.io/npm/v/astro-flyweb)](https://www.npmjs.com/package/astro-flyweb) |

## CLI

```bash
npx flyweb check https://example.com   # check any website
npx flyweb check ./flyweb.json         # validate local file
npx flyweb init                         # generate starter config
```

## Quick Start

**Next.js:**
```bash
npm install next-flyweb
```
```ts
// app/.well-known/flyweb.json/route.ts
import { createHandler } from 'next-flyweb';

export const GET = createHandler({
  flyweb: '1.0',
  entity: 'My Blog',
  type: 'blog',
  resources: {
    posts: {
      path: '/.flyweb/posts',
      format: 'jsonl',
      fields: ['title', 'author', 'date', 'content'],
      query: '?tag={tag}',
    },
  },
});
```

**Astro:**
```bash
npm install astro-flyweb
```
```ts
// astro.config.mjs
import flyweb from 'astro-flyweb';

export default defineConfig({
  integrations: [
    flyweb({
      entity: 'My Docs',
      type: 'docs',
      resources: {
        pages: {
          path: '/.flyweb/pages',
          format: 'jsonl',
          fields: ['title', 'slug', 'content'],
        },
      },
    }),
  ],
});
```

**Any site (static file):**
```bash
npx flyweb init > public/.well-known/flyweb.json
```

## Badge

Add to your README to show your site supports FlyWeb:

```md
[![FlyWeb enabled](https://raw.githubusercontent.com/flywebprotocol/flyweb/master/badge.svg)](https://flyweb.io)
```

## The Three Layers

1. **Discovery** — `/.well-known/flyweb.json` tells machines what data you have
2. **Structure** — Resources served as clean JSON/JSONL, not HTML
3. **Query** — Standard URL params for filtering: `?tag=ai&limit=10`

## Spec

Read the full protocol specification: [SPEC.md](./SPEC.md)

## Framework RFCs

We've proposed native FlyWeb support in major frameworks:

- [Next.js](https://github.com/vercel/next.js/issues/90075)
- [Astro](https://github.com/withastro/astro/issues/15547)
- [Nuxt](https://github.com/nuxt/nuxt/issues/34343)
- [SvelteKit](https://github.com/sveltejs/kit/issues/15326)
- [Remix](https://github.com/remix-run/remix/issues/11074)

## Links

- [flyweb.io](https://flyweb.io) — Homepage
- [Spec](./SPEC.md) — Protocol specification
- [X/Twitter](https://x.com/flywebprotocol) — Updates

## License

MIT
