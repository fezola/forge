import { ForgeClient } from '@forge/sdk';

export const api = new ForgeClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});
