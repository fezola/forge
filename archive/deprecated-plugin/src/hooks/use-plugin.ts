'use client';

import { useState, useCallback } from 'react';
import { ForgePluginState } from '@forge/forge-components';

export function usePlugin() {
  const [state, setState] = useState<ForgePluginState>({
    connected: false,
    projectId: null,
    apiKey: null,
    selectedComponent: null,
  });

  const connect = useCallback((apiKey: string, projectId: string) => {
    setState({ connected: true, apiKey, projectId, selectedComponent: null });
  }, []);

  const disconnect = useCallback(() => {
    setState({ connected: false, projectId: null, apiKey: null, selectedComponent: null });
  }, []);

  const selectComponent = useCallback((componentId: string | null) => {
    setState(prev => ({ ...prev, selectedComponent: componentId }));
  }, []);

  return { state, connect, disconnect, selectComponent };
}
