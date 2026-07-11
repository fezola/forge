'use client';

import { useState, useEffect, useCallback } from 'react';
import { identityApi } from '../lib/identity-api';

const PROJECT_ID = 'default';

export function useIdentities() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await identityApi.list(PROJECT_ID);
      setData(Array.isArray(res) ? res : res.data ?? res.identities ?? []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch identities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, mutate: fetch };
}

export function useIdentity(id: string) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await identityApi.get(id);
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

export function useIdentitySessions() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await identityApi.getSessions();
      setData(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, mutate: fetch };
}

export function useIdentityWallets() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await identityApi.getWallets();
      setData(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, mutate: fetch };
}