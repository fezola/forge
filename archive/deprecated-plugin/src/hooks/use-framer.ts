'use client';

import { useEffect, useCallback } from 'react';

export function useFramer() {
  const postMessage = useCallback((type: string, payload?: unknown) => {
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ source: 'forge-plugin', type, payload }, '*');
    }
  }, []);

  const onFramerMessage = useCallback((handler: (data: any) => void) => {
    const listener = (event: MessageEvent) => {
      if (event.data?.source === 'framer') {
        handler(event.data);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  return { postMessage, onFramerMessage };
}
