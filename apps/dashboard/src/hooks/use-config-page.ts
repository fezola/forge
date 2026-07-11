'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ConfigEntry, FeatureFlag, Environment, BrandConfig, ConfigAuditEntry, FeatureFlagEvaluation } from '@forge/config-types';
import { configApi } from '../lib/config-api';

const PROJECT_ID = 'default';

export function useConfigPage() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await configApi.list(PROJECT_ID);
      setConfigs(res.items ?? res ?? []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch configs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { configs, loading, error, mutate: fetch };
}

export function useFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setFlags(await configApi.featureFlags.list(PROJECT_ID)); } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { flags, loading, mutate: fetch };
}

export function useEnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setEnvironments(await configApi.environments.list(PROJECT_ID)); } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { environments, loading, mutate: fetch };
}

export function useBrandPage() {
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setBrand(await configApi.brand.get(PROJECT_ID)); } catch { setBrand(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { brand, loading, mutate: fetch };
}

export function useAuditPage(configId?: string) {
  const [audit, setAudit] = useState<ConfigAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setAudit(await configApi.audit(configId, PROJECT_ID)); } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [configId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { audit, loading, mutate: fetch };
}