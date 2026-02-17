import { createHandler } from 'next-flyweb';

export const GET = createHandler({
  flyweb: '1.0',
  entity: 'FlyWeb Example Blog',
  type: 'blog',
  url: 'http://localhost:3000',
  description: 'A demo blog showing how to use next-flyweb',
  resources: {
    posts: {
      path: '/.flyweb/posts',
      format: 'jsonl',
      fields: ['slug', 'title', 'author', 'date', 'tags', 'summary', 'content'],
      query: '?tag={tag}&author={author}&limit={n}&offset={n}',
      description: 'Blog posts',
    },
  },
});
