import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlyWeb Example Blog',
  description: 'A demo blog showing how to use next-flyweb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        {children}
      </body>
    </html>
  );
}
