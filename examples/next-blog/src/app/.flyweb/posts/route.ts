import { createResourceHandler } from 'next-flyweb';
import { getAllPosts } from '@/lib/posts';

export const GET = createResourceHandler({
  format: 'jsonl',
  source: getAllPosts,
  queryable: ['tag', 'author'],
  maxLimit: 50,
});
