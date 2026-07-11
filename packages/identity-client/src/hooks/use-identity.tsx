import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { IdentityClient } from '../identity-client';
import { ForgeIdentity, AuthResult, AuthCredentials } from '@forge/identity-types';

interface IdentityContextType {
  client: IdentityClient | null;
  identity: ForgeIdentity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  linkProvider: (credentials: AuthCredentials) => Promise<void>;
}

const IdentityContext = createContext<IdentityContextType | null>(null);

export function IdentityProvider({
  client,
  children,
}: {
  client: IdentityClient;
  children: ReactNode;
}) {
  const [identity, setIdentity] = useState<ForgeIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (client) {
      client.getProfile()
        .then(setIdentity)
        .catch(() => setIdentity(null))
        .finally(() => setIsLoading(false));
    }
  }, [client]);

  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    const result = await client.login(credentials);
    client.setToken(result.accessToken);
    setIdentity(result.identity);
    return result;
  }, [client]);

  const logout = useCallback(async () => {
    try {
      await client.logout('');
    } finally {
      client.setToken('');
      setIdentity(null);
    }
  }, [client]);

  const linkProvider = useCallback(async (_credentials: AuthCredentials) => {
    const profile = await client.getProfile();
    setIdentity(profile);
  }, [client]);

  return (
    <IdentityContext.Provider
      value={{
        client,
        identity,
        isAuthenticated: !!identity,
        isLoading,
        login,
        logout,
        linkProvider,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextType {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider');
  return ctx;
}

export function useUser(): ForgeIdentity | null {
  const { identity } = useIdentity();
  return identity;
}