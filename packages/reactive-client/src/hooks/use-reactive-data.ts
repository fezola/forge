import { useState, useEffect, useRef } from 'react';
import { RealtimeClient } from '../realtime-client';
import { ReactiveClientConfig } from '../reactive-client';
import { deepResolve } from '../utils/deep-resolve';

export function useReactiveData(sourceId: string, path?: string, config?: ReactiveClientConfig) {
  const [data, setData] = useState<unknown>(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<RealtimeClient | null>(null);

  useEffect(() => {
    if (!config) return;
    const client = new RealtimeClient(config);
    clientRef.current = client;
    client.connect();

    client.subscribe(sourceId, (newData) => {
      const resolved = path ? deepResolve(newData as Record<string, unknown>, path) : newData;
      setData(resolved);
    });

    setConnected(true);
    return () => { client.disconnect(); };
  }, [sourceId, path, config?.baseUrl]);

  return { data, connected };
}
