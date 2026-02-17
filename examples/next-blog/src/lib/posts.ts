export interface Post {
  slug: string;
  title: string;
  author: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
}

export const posts: Post[] = [
  {
    slug: 'what-is-flyweb',
    title: 'What is FlyWeb?',
    author: 'Sarah Chen',
    date: '2026-02-15',
    tags: ['flyweb', 'protocol', 'intro'],
    summary:
      'FlyWeb is an open protocol that makes the internet machine-readable by letting websites describe their content in a structured way.',
    content:
      'The web was built for human browsers. HTML pages are rendered visually, but their underlying structure is inconsistent. FlyWeb changes this by introducing a standard discovery file at /.well-known/flyweb.json that tells AI agents exactly what structured data a website offers and how to access it.',
  },
  {
    slug: 'why-ai-needs-structured-web',
    title: 'Why AI Needs a Structured Web',
    author: 'Mike Johnson',
    date: '2026-02-12',
    tags: ['ai', 'web', 'standards'],
    summary:
      'AI agents scrape HTML, guess at content structure, and hallucinate when they get it wrong. There has to be a better way.',
    content:
      'Every day, millions of AI agents crawl the web looking for information. They parse raw HTML, try to distinguish content from navigation, and often get it wrong. The result is hallucinated facts, misattributed quotes, and wasted compute. FlyWeb provides a standard way for websites to serve clean, structured data that any agent can consume reliably.',
  },
  {
    slug: 'getting-started-nextjs',
    title: 'Adding FlyWeb to Your Next.js App',
    author: 'Sarah Chen',
    date: '2026-02-10',
    tags: ['flyweb', 'nextjs', 'tutorial'],
    summary:
      'A step-by-step guide to making your Next.js application FlyWeb-compatible in under 5 minutes.',
    content:
      'Adding FlyWeb support to a Next.js app is straightforward. Install the next-flyweb package, create a route handler for your discovery file, and add resource handlers for your data endpoints. This post walks through each step with code examples.',
  },
];

export function getAllPosts(): Post[] {
  return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
