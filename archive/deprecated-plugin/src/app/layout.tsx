import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forge — Framer Plugin',
  description: 'Embed Forge data in your Framer sites',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
