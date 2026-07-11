'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ForgePluginState } from '@forge/forge-components';

interface PluginContextType {
  state: ForgePluginState;
  connect: (apiKey: string, projectId: string) => void;
  disconnect: () => void;
  selectComponent: (componentId: string | null) => void;
}

const PluginContext = createContext<PluginContextType | null>(null);

export function PluginProvider({ children }: { children: ReactNode }) {
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

  return (
    <PluginContext.Provider value={{ state, connect, disconnect, selectComponent }}>
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugin() {
  const ctx = useContext(PluginContext);
  if (!ctx) throw new Error('usePlugin must be used within PluginProvider');
  return ctx;
}
