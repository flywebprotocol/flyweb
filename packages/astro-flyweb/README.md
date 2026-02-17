# astro-flyweb

[FlyWeb](https://flyweb.io) integration for Astro — auto-generate `/.well-known/flyweb.json` so AI agents can discover your structured content.

## Install

```bash
npm install astro-flyweb
```

## Usage

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import flyweb from 'astro-flyweb';

export default defineConfig({
  integrations: [
    flyweb({
      entity: 'My Docs Site',
      type: 'docs',
      url: 'https://docs.example.com',
      resources: {
        pages: {
          path: '/.flyweb/pages',
          format: 'jsonl',
          fields: ['title', 'slug', 'content', 'category'],
          query: '?category={category}',
        },
      },
    }),
  ],
});
```

The integration generates `public/.well-known/flyweb.json` automatically during build. AI agents can then discover your content at `https://yoursite.com/.well-known/flyweb.json`.

## How It Works

1. Add the integration to your Astro config
2. Define your entity, type, and resources
3. Build your site — `flyweb.json` is generated automatically
4. AI agents discover and consume your structured data

## Links

- [flyweb.io](https://flyweb.io) — Project homepage
- [Spec](https://github.com/flywebprotocol/flyweb/blob/master/SPEC.md) — Protocol specification
- [`flyweb`](https://www.npmjs.com/package/flyweb) — Core package
- [`next-flyweb`](https://www.npmjs.com/package/next-flyweb) — Next.js integration

## License

MIT
