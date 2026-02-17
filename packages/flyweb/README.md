# flyweb

Core types, validation, and helpers for the [FlyWeb protocol](https://flyweb.io) — an open standard that makes the internet machine-readable.

> `robots.txt` tells machines where **not** to go.
> `flyweb.json` tells them **what you have**.

## Install

```bash
npm install flyweb
```

## Usage

### Define a config

```ts
import { defineConfig } from 'flyweb';

export default defineConfig({
  flyweb: '1.0',
  entity: 'TechCrunch',
  type: 'news',
  resources: {
    articles: {
      path: '/.flyweb/articles',
      format: 'jsonl',
      fields: ['title', 'author', 'date', 'summary', 'content', 'tags'],
      query: '?tag={tag}&limit={n}',
    },
    authors: {
      path: '/.flyweb/authors',
      format: 'json',
      fields: ['name', 'bio', 'avatar'],
    },
  },
});
```

### Validate a config

```ts
import { validate } from 'flyweb';

const result = validate(someObject);

if (!result.valid) {
  console.error(result.errors);
  // ["resources.posts.path: must start with \"/\"",
  //  "resources.posts.format: must be one of json, jsonl, csv, xml"]
}
```

## The Protocol

Every website publishes a file at `/.well-known/flyweb.json` that describes its structured data:

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

AI agents check this file first. No scraping. No guessing. Just structured data.

## Types

```ts
import type { FlyWebConfig, FlyWebResource, EntityType, ResourceFormat } from 'flyweb';
```

| Type | Description |
|------|-------------|
| `FlyWebConfig` | Root config object served at `/.well-known/flyweb.json` |
| `FlyWebResource` | A single resource (path, format, fields, query) |
| `EntityType` | `'news' \| 'blog' \| 'ecommerce' \| 'saas' \| 'docs' \| ...` |
| `ResourceFormat` | `'json' \| 'jsonl' \| 'csv' \| 'xml'` |

## Framework Integrations

- **Next.js** — [`next-flyweb`](https://www.npmjs.com/package/next-flyweb)

## Links

- [flyweb.io](https://flyweb.io) — Project homepage
- [GitHub](https://github.com/flywebprotocol/flyweb) — Source code
- [X/Twitter](https://x.com/flywebprotocol) — Updates

## License

MIT
