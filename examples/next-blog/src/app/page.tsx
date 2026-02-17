import { posts } from '@/lib/posts';

export default function Home() {
  return (
    <main>
      <h1>FlyWeb Example Blog</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This blog is FlyWeb-enabled. Try{' '}
        <a href="/.well-known/flyweb.json" style={{ color: '#0070f3' }}>
          /.well-known/flyweb.json
        </a>{' '}
        or{' '}
        <a href="/.flyweb/posts" style={{ color: '#0070f3' }}>
          /.flyweb/posts
        </a>{' '}
        or{' '}
        <a href="/.flyweb/posts?tag=ai" style={{ color: '#0070f3' }}>
          /.flyweb/posts?tag=ai
        </a>
      </p>

      {posts.map((post) => (
        <article key={post.slug} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>{post.title}</h2>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {post.author} &middot; {post.date} &middot; {post.tags.join(', ')}
          </p>
          <p style={{ color: '#444' }}>{post.summary}</p>
        </article>
      ))}
    </main>
  );
}
