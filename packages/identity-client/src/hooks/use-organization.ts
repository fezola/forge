import { useState, useEffect, useCallback } from 'react';
import { Organization, OrganizationMember } from '@forge/identity-types';
import { useIdentity } from './use-identity';

export function useOrganizations() {
  const { client } = useIdentity();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    client.getOrganizations()
      .then(setOrganizations)
      .catch(() => setOrganizations([]))
      .finally(() => setIsLoading(false));
  }, [client]);

  const createOrganization = useCallback(async (name: string, slug: string) => {
    if (!client) throw new Error('Not connected');
    const org = await client.createOrganization({
      projectId: '',
      name,
      slug,
      ownerId: '',
    });
    setOrganizations(prev => [...prev, org]);
    return org;
  }, [client]);

  const switchOrganization = useCallback(async (orgId: string) => {
    return client?.getOrganization(orgId);
  }, [client]);

  return {
    organizations,
    isLoading,
    createOrganization,
    switchOrganization,
    currentOrganization: organizations[0] ?? null,
  };
}

export function useOrganizationMembers(orgId: string) {
  const { client } = useIdentity();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client || !orgId) return;
    client.getOrganizationMembers(orgId)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setIsLoading(false));
  }, [client, orgId]);

  return { members, isLoading };
}