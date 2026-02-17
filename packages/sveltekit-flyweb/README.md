# sveltekit-flyweb

[FlyWeb](https://flyweb.io) integration for SvelteKit — serve structured data to AI agents.

## Install

```bash
npm install sveltekit-flyweb
```

## Usage

```ts
// src/routes/.well-known/flyweb.json/+server.ts
import { createHandler } from 'sveltekit-flyweb';

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

```ts
// src/routes/.flyweb/posts/+server.ts
import { createResourceHandler } from 'sveltekit-flyweb';
import { getAllPosts } from '$lib/posts';

export const GET = createResourceHandler({
  format: 'jsonl',
  source: getAllPosts,
  queryable: ['tag', 'author'],
});
```

## Links

- [flyweb.io](https://flyweb.io) — Project homepage
- [Spec](https://github.com/flywebprotocol/flyweb/blob/master/SPEC.md) — Protocol specification
- [`flyweb`](https://www.npmjs.com/package/flyweb) — Core package

## License

MIT
