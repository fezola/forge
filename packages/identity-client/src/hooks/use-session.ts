import { useState, useEffect } from 'react';
import { SessionSummary } from '@forge/identity-types';
import { useIdentity } from './use-identity';

export function useSessions() {
  const { client } = useIdentity();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    client.getSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setIsLoading(false));
  }, [client]);

  return { sessions, isLoading };
}