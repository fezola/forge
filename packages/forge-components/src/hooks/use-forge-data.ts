export interface ForgeDataResult {
  data: unknown;
  loading: boolean;
  error: string | null;
}

export function useForgeData(config?: unknown, options?: unknown): ForgeDataResult {
  return { data: null, loading: false, error: null };
}
