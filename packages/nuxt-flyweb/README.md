# nuxt-flyweb

[FlyWeb](https://flyweb.io) integration for Nuxt — auto-generate `/.well-known/flyweb.json` so AI agents can discover your structured content.

## Install

```bash
npm install nuxt-flyweb
```

## Usage

```ts
// nuxt.config.ts
import flyweb from 'nuxt-flyweb';

export default defineNuxtConfig({
  modules: [
    [flyweb, {
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
    }],
  ],
});
```

## Links

- [flyweb.io](https://flyweb.io) — Project homepage
- [Spec](https://github.com/flywebprotocol/flyweb/blob/master/SPEC.md) — Protocol specification
- [`flyweb`](https://www.npmjs.com/package/flyweb) — Core package

## License

MIT
