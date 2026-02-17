# FlyWeb

**SEO for the AI era. Make your website visible, readable, and cited by every AI agent.**

[![npm](https://img.shields.io/npm/v/flyweb)](https://www.npmjs.com/package/flyweb)
[![FlyWeb enabled](https://raw.githubusercontent.com/flywebprotocol/flyweb/master/badge.svg)](https://flyweb.io)

An open protocol that lets every website describe its content in a structured way machines can understand. One file. Universal discovery. Enforced attribution.

> `robots.txt` tells machines where **not** to go.
> `flyweb.json` tells them **what you have** — and **how to credit you**.

## How It Works

Every website publishes `/.well-known/flyweb.json`:

```json
{
  "flyweb": "1.0",
  "entity": "TechCrunch",
  "type": "news",
  "attribution": {
    "required": true,
    "license": "CC-BY-4.0",
    "must_link": true
  },
  "resources": {
    "articles": {
      "path": "/.flyweb/articles",
      "format": "jsonl",
      "fields": ["title", "author", "date", "content"],
      "access": "free",
      "query": "?tag={tag}"
    }
  }
}
```

AI agents check this file first — no scraping, no guessing. Your content, your credit, your terms.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`flyweb`](./packages/flyweb) | Core types, validation, CLI, and client SDK | [![npm](https://img.shields.io/npm/v/flyweb)](https://www.npmjs.com/package/flyweb) |
| [`next-flyweb`](./packages/next-flyweb) | Next.js integration | [![npm](https://img.shields.io/npm/v/next-flyweb)](https://www.npmjs.com/package/next-flyweb) |
| [`astro-flyweb`](./packages/astro-flyweb) | Astro integration | [![npm](https://img.shields.io/npm/v/astro-flyweb)](https://www.npmjs.com/package/astro-flyweb) |
| [`sveltekit-flyweb`](./packages/sveltekit-flyweb) | SvelteKit integration | [![npm](https://img.shields.io/npm/v/sveltekit-flyweb)](https://www.npmjs.com/package/sveltekit-flyweb) |
| [`nuxt-flyweb`](./packages/nuxt-flyweb) | Nuxt/Vue integration | [![npm](https://img.shields.io/npm/v/nuxt-flyweb)](https://www.npmjs.com/package/nuxt-flyweb) |
| [`express-flyweb`](./packages/express-flyweb) | Express/Node.js middleware | [![npm](https://img.shields.io/npm/v/express-flyweb)](https://www.npmjs.com/package/express-flyweb) |

## CLI

```bash
npx flyweb check https://example.com   # check any website
npx flyweb check ./flyweb.json         # validate local file
npx flyweb discover https://example.com # discover & fetch structured data
npx flyweb init                         # generate starter config
```

## Client SDK

For AI agents and developers consuming FlyWeb-enabled sites:

```ts
import { discover, fetchResource } from 'flyweb/client';

const site = await discover('https://example.com');
console.log(site.config.entity); // "TechCrunch"

const articles = await fetchResource(
  'https://example.com',
  site.config.resources.articles,
  { params: { tag: 'ai' }, limit: 10 }
);
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
  attribution: { required: true, license: 'CC-BY-4.0', must_link: true },
  resources: {
    posts: {
      path: '/.flyweb/posts',
      format: 'jsonl',
      fields: ['title', 'author', 'date', 'content'],
      access: 'free',
    },
  },
});
```

**SvelteKit:**
```bash
npm install sveltekit-flyweb
```
```ts
// src/routes/.well-known/flyweb.json/+server.ts
import { createHandler } from 'sveltekit-flyweb';

export const GET = createHandler({
  flyweb: '1.0',
  entity: 'My Blog',
  type: 'blog',
  resources: { posts: { path: '/.flyweb/posts', format: 'jsonl', fields: ['title', 'content'] } },
});
```

**Express:**
```bash
npm install express-flyweb
```
```ts
import express from 'express';
import { flyweb } from 'express-flyweb';

const app = express();
app.use(flyweb({
  flyweb: '1.0',
  entity: 'My API',
  type: 'api',
  resources: { items: { path: '/.flyweb/items', format: 'json', fields: ['id', 'name'] } },
}));
```

**Astro / Nuxt / Any site:**
```bash
npm install astro-flyweb    # Astro
npm install nuxt-flyweb     # Nuxt
npx flyweb init              # Any site — generates flyweb.json
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

## Attribution

FlyWeb enforces attribution at the protocol level. Even on the free tier, AI agents must credit the source:

```json
"attribution": {
  "required": true,
  "format": "Source: {entity} — {url}",
  "license": "CC-BY-4.0",
  "must_link": true
}
```

> You can set price to zero. You can never set attribution to zero.

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
