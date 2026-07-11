import { useState, useEffect, useCallback, useRef } from 'react';
import { ExpressionClient } from '../expression-client';
import { ReactiveClientConfig } from '../reactive-client';

export function useExpression(expression: string, context: Record<string, unknown>, config: ReactiveClientConfig) {
  const [result, setResult] = useState<{ value: unknown; error?: string }>({ value: null });
  const [loading, setLoading] = useState(false);
  const clientRef = useRef<ExpressionClient>(new ExpressionClient(config));

  const evaluate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientRef.current.evaluate(expression, context);
      setResult(res);
    } catch (e: any) {
      setResult({ value: null, error: e.message });
    } finally {
      setLoading(false);
    }
  }, [expression, JSON.stringify(context)]);

  useEffect(() => { evaluate(); }, [evaluate]);

  return { ...result, loading, refresh: evaluate };
}
