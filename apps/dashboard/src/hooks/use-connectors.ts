'use client';

import { useState, useEffect, useCallback } from 'react';
import { connectorApi } from '../lib/connector-api';
import type {
  ConnectorInstallationDTO,
  MarketplaceListing,
  ActionDefinition,
  TriggerDefinition,
  SecretDTO,
} from '@forge/types';

export function useConnectors(projectId: string) {
  const [data, setData] = useState<ConnectorInstallationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await connectorApi.list(projectId);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch connectors');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}

export function useConnector(id: string) {
  const [data, setData] = useState<{
    installation: ConnectorInstallationDTO;
    actions: ActionDefinition[];
    triggers: TriggerDefinition[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await connectorApi.get(id);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch connector');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}

export function useMarketplace(query?: string, category?: string, page?: number, limit?: number) {
  const [data, setData] = useState<{
    listings: MarketplaceListing[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await connectorApi.browseMarketplace(query, category, page, limit);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch marketplace');
    } finally {
      setLoading(false);
    }
  }, [query, category, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}

export function useCustomConnectors(projectId: string) {
  const [data, setData] = useState<ConnectorInstallationDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await connectorApi.listCustom(projectId);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch custom connectors');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}
