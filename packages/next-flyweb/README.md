# next-flyweb

[FlyWeb](https://flyweb.io) integration for Next.js — serve structured data to AI agents with zero effort.

## Install

```bash
npm install next-flyweb
```

## Quick Start

### 1. Serve your flyweb.json

Create a route handler at `app/.well-known/flyweb.json/route.ts`:

```ts
import { createHandler } from 'next-flyweb';

export const GET = createHandler({
  flyweb: '1.0',
  entity: 'My Blog',
  type: 'blog',
  url: 'https://myblog.com',
  resources: {
    posts: {
      path: '/.flyweb/posts',
      format: 'jsonl',
      fields: ['title', 'author', 'date', 'summary', 'content', 'tags'],
      query: '?tag={tag}&limit={n}',
    },
  },
});
```

That's it. Every AI agent on earth can now discover your content at `https://myblog.com/.well-known/flyweb.json`.

### 2. Serve your data

Create a resource handler at `app/.flyweb/posts/route.ts`:

```ts
import { createResourceHandler } from 'next-flyweb';
import { getAllPosts } from '@/lib/posts';

export const GET = createResourceHandler({
  format: 'jsonl',
  source: getAllPosts,
  queryable: ['tag', 'author'],
  maxLimit: 50,
});
```

Now AI agents can query your posts:

```
GET /.flyweb/posts              → all posts (JSONL)
GET /.flyweb/posts?tag=ai       → filtered by tag
GET /.flyweb/posts?limit=10     → first 10 posts
GET /.flyweb/posts?offset=10    → skip first 10
```

## API

### `createHandler(config)`

Creates a GET handler that serves your `flyweb.json`. Validates the config at build time and returns a properly cached JSON response with CORS headers.

**Parameters:**
- `config: FlyWebConfig` — your FlyWeb configuration

### `createResourceHandler(options)`

Creates a GET handler that serves structured data with filtering and pagination.

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `format` | `'json' \| 'jsonl'` | Response format |
| `source` | `() => T[] \| Promise<T[]>` | Function that returns your data |
| `queryable` | `string[]` | Fields that can be filtered via query params |
| `maxLimit` | `number` | Max items per request (default: 100) |

### Re-exports

`next-flyweb` re-exports everything from `flyweb` for convenience:

```ts
import { defineConfig, validate } from 'next-flyweb';
import type { FlyWebConfig, FlyWebResource } from 'next-flyweb';
```

## Full Example

```
app/
├── .well-known/
│   └── flyweb.json/
│       └── route.ts          ← createHandler()
├── .flyweb/
│   ├── posts/
│   │   └── route.ts          ← createResourceHandler()
│   └── authors/
│       └── route.ts          ← createResourceHandler()
└── page.tsx
```

## Links

- [flyweb.io](https://flyweb.io) — Project homepage
- [GitHub](https://github.com/flywebprotocol/flyweb) — Source code
- [`flyweb`](https://www.npmjs.com/package/flyweb) — Core package

## License

MIT
