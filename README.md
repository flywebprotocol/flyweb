# FlyWeb

**Make the internet machine-readable.**

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
| [`flyweb`](./packages/flyweb) | Core types, validation, and helpers | [![npm](https://img.shields.io/npm/v/flyweb)](https://www.npmjs.com/package/flyweb) |
| [`next-flyweb`](./packages/next-flyweb) | Next.js integration | [![npm](https://img.shields.io/npm/v/next-flyweb)](https://www.npmjs.com/package/next-flyweb) |

## Quick Start (Next.js)

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

## The Three Layers

1. **Discovery** — `/.well-known/flyweb.json` tells machines what data you have
2. **Structure** — Resources served as clean JSON/JSONL, not HTML
3. **Query** — Standard URL params for filtering: `?tag=ai&limit=10`

## Links

- [flyweb.io](https://flyweb.io) — Homepage
- [X/Twitter](https://x.com/flywebprotocol) — Updates

## License

MIT
