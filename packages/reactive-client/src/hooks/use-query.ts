import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryClient } from '../query-client';
import { QueryExecuteRequest, QueryResult } from '@forge/reactive-types';
import { ReactiveClientConfig } from '../reactive-client';

export function useReactiveQuery(request: QueryExecuteRequest, config: ReactiveClientConfig) {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<QueryClient>(new QueryClient(config));

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientRef.current.execute(request);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(request)]);

  useEffect(() => { execute(); }, [execute]);

  return { items: result?.items || [], total: result?.total || 0, loading, error, refresh: execute };
}
