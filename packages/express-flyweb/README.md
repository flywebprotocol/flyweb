# express-flyweb

[FlyWeb](https://flyweb.io) middleware for Express, Hono, Fastify, and any Node.js HTTP server — serve structured data to AI agents.

## Install

```bash
npm install express-flyweb
```

## Usage

```ts
import express from 'express';
import { flyweb, createResourceHandler } from 'express-flyweb';

const app = express();

// Serve flyweb.json at /.well-known/flyweb.json
app.use(flyweb({
  flyweb: '1.0',
  entity: 'My API',
  type: 'api',
  attribution: { required: true, license: 'MIT', must_link: true },
  resources: {
    items: {
      path: '/.flyweb/items',
      format: 'json',
      fields: ['id', 'name', 'description'],
      access: 'free',
    },
  },
}));

// Serve resource data
app.get('/.flyweb/items', createResourceHandler({
  format: 'json',
  source: () => getItems(),
  queryable: ['category'],
}));

app.listen(3000);
```

## Works With

- Express 4/5
- Connect
- Any Node.js HTTP server (http.createServer)
- Fastify (with middie plugin)

## Links

- [flyweb.io](https://flyweb.io) — Project homepage
- [Spec](https://github.com/flywebprotocol/flyweb/blob/master/SPEC.md) — Protocol specification
- [`flyweb`](https://www.npmjs.com/package/flyweb) — Core package

## License

MIT
