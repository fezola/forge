import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@forge/ui', '@forge/sdk', '@forge/types'],
  images: {
    domains: [process.env.NEXT_PUBLIC_API_URL?.replace(/https?:\/\//, '') || 'localhost'],
  },
  output: 'standalone',
};

export default nextConfig;
