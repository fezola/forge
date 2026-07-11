import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@forge/sdk', '@forge/types', '@forge/forge-components', '@forge/reactive-client', '@forge/reactive-types'],
  output: 'export',
};

export default nextConfig;
