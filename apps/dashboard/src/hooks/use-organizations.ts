'use client';

import { useState, useEffect, useCallback } from 'react';
import { identityApi } from '../lib/identity-api';

const PROJECT_ID = 'default';

export function useOrganizations() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await identityApi.listOrganizations();
      setData(Array.isArray(res) ? res : res.data ?? res.organizations ?? []);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, mutate: fetch };
}

export function useCreateOrganization() {
  const [loading, setLoading] = useState(false);
  const create = async (name: string, slug: string, description?: string) => {
    setLoading(true);
    try {
      return await identityApi.createOrganization({
        projectId: PROJECT_ID,
        name,
        slug,
        description,
        ownerId: 'current-user-id',
      });
    } finally {
      setLoading(false);
    }
  };
  return { create, loading };
}

export function useOrganizationDetail(id: string) {
  const [data, setData] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [org, m] = await Promise.all([
        identityApi.getOrganization(id),
        identityApi.getMembers(id),
      ]);
      setData(org.data ?? org);
      setMembers(Array.isArray(m) ? m : m.data ?? m.members ?? []);
    } catch {
      setData(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, members, loading, mutate: fetch };
}

export function useRoles() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await identityApi.getRoles(PROJECT_ID);
      setData(Array.isArray(res) ? res : res.data ?? res.roles ?? []);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, mutate: fetch };
}