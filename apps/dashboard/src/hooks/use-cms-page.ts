'use client';

import { useState, useEffect, useCallback } from 'react';
import { cmsApi } from '../lib/cms-api';

const PROJECT_ID = 'default';

export function useCmsCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsApi.listCollections(PROJECT_ID);
      setCollections(Array.isArray(res) ? res : res.items ?? []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch CMS collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { collections, loading, error, mutate: fetch };
}

export function useCmsCollectionDetail(id: string) {
  const [collection, setCollection] = useState<any | null>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [col, syncs] = await Promise.all([
        cmsApi.getCollection(id),
        cmsApi.getSyncHistory(id),
      ]);
      setCollection(col);
      setSyncHistory(Array.isArray(syncs) ? syncs : syncs.items ?? []);
    } catch {
      setCollection(null);
      setSyncHistory([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { collection, syncHistory, loading, mutate: fetch };
}

export function useCmsStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await cmsApi.getStats(PROJECT_ID));
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, mutate: fetch };
}