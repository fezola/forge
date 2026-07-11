import { useState, useEffect, useCallback, useRef } from 'react';
import { BindingClient } from '../binding-client';
import { BindingResult } from '@forge/reactive-types';
import { ReactiveClientConfig } from '../reactive-client';

export function useBinding(bindingId: string, config: ReactiveClientConfig) {
  const [data, setData] = useState<BindingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<BindingClient>(new BindingClient(config));

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clientRef.current.resolve(bindingId);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [bindingId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useBindingSource(
  source: Record<string, unknown>,
  config: ReactiveClientConfig,
  transform?: Record<string, unknown>,
) {
  const [data, setData] = useState<BindingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<BindingClient>(new BindingClient(config));

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await clientRef.current.resolveAll([{ id: 'dynamic', source, ...(transform ? { transform } : {}) }]);
      const result = results.results?.[0];
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(source)]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data: data?.value, loading, error, refresh };
}
