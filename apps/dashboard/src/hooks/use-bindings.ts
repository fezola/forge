'use client';

import { useState, useEffect, useCallback } from 'react';
import { bindingApi } from '../lib/binding-api';

export function useBindings(projectId: string) {
  const [data, setData] = useState<BindingDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await bindingApi.list(projectId);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch bindings');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}

export function useBinding(id: string) {
  const [data, setData] = useState<BindingDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await bindingApi.get(id);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch binding');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}

export function useBindingPreview(source: Record<string, unknown>) {
  const [data, setData] = useState<BindingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    if (!source || Object.keys(source).length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await bindingApi.executeQuery({
        sourceType: String(source.type ?? ''),
        config: source,
      });
      setData(res.data ?? res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Preview failed');
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refresh: execute };
}

export interface BindingDefinition {
  id: string;
  projectId: string;
  name: string;
  sourceType: 'user' | 'connector' | 'database' | 'workflow' | 'computed' | 'static';
  sourceConfig: Record<string, unknown>;
  targetComponentId?: string;
  targetProperty?: string;
  formula?: string;
  status: 'active' | 'error' | 'inactive';
  lastResolved?: string;
  resolvedValue?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface BindingResult {
  value: unknown;
  type: string;
  resolved: boolean;
  error?: string;
  resolvedAt: string;
}
