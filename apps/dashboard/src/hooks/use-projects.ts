'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectApi } from '../lib/project-api';

const PROJECT_ID = 'default';

export function useProjects() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectApi.list();
      setData(Array.isArray(res) ? res : res.data ?? []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, mutate: fetch };
}

export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const create = async (name: string, description?: string) => {
    setLoading(true);
    try {
      return await projectApi.create({ name, description });
    } finally {
      setLoading(false);
    }
  };
  return { create, loading };
}

export function useProject(id: string) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await projectApi.get(id);
      setData(res.data ?? res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, mutate: fetch };
}