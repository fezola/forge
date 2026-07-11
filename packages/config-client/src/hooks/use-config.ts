import { useState, useEffect, useCallback } from 'react';
import { ConfigClient, ConfigClientConfig } from '../config-client';
import type {
  ConfigEntry, FeatureFlag,
  Environment, BrandConfig, BlockchainConfig, AiConfig,
  ConfigAuditEntry, FeatureFlagEvaluation,
} from '@forge/config-types';

interface UseConfigResult {
  configs: ConfigEntry[];
  configsLoading: boolean;
  configsError: string | null;
  listConfigs: () => Promise<void>;
  getConfig: (id: string) => Promise<ConfigEntry | null>;
  createConfig: (input: any) => Promise<ConfigEntry | null>;
  updateConfig: (id: string, input: any) => Promise<ConfigEntry | null>;
  deleteConfig: (id: string) => Promise<void>;

  featureFlags: FeatureFlag[];
  flagsLoading: boolean;
  listFlags: () => Promise<void>;
  evaluateFlag: (id: string, context?: any) => Promise<FeatureFlagEvaluation>;

  environments: Environment[];
  envsLoading: boolean;
  listEnvironments: () => Promise<void>;

  brand: BrandConfig | null;
  brandLoading: boolean;
  loadBrand: () => Promise<void>;

  blockchain: BlockchainConfig[];
  loadBlockchain: () => Promise<void>;
  ai: AiConfig[];
  loadAi: () => Promise<void>;

  resolvedValue: string | undefined;
  resolveValue: (key: string, environmentId: string) => Promise<void>;

  audit: ConfigAuditEntry[];
  loadAudit: (configId?: string) => Promise<void>;

  client: ConfigClient;
}

export function useConfig(config: ConfigClientConfig): UseConfigResult {
  const client = new ConfigClient(config);

  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [configsError, setConfigsError] = useState<string | null>(null);

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [envsLoading, setEnvsLoading] = useState(false);

  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);

  const [blockchain, setBlockchain] = useState<BlockchainConfig[]>([]);
  const [ai, setAi] = useState<AiConfig[]>([]);
  const [audit, setAudit] = useState<ConfigAuditEntry[]>([]);
  const [resolvedValue, setResolvedValue] = useState<string | undefined>();

  const listConfigs = useCallback(async () => {
    setConfigsLoading(true);
    try {
      const result = await client.listConfigs();
      setConfigs(result.items);
      setConfigsError(null);
    } catch (e: unknown) {
      setConfigsError(e instanceof Error ? e.message : 'Failed to list configs');
    } finally {
      setConfigsLoading(false);
    }
  }, []);

  const getConfig = useCallback(async (id: string): Promise<ConfigEntry | null> => {
    try { return await client.getConfig(id); } catch { return null; }
  }, []);

  const createConfig = useCallback(async (input: any): Promise<ConfigEntry | null> => {
    try { const c = await client.createConfig(input); await listConfigs(); return c; } catch { return null; }
  }, []);

  const updateConfig = useCallback(async (id: string, input: any): Promise<ConfigEntry | null> => {
    try { const c = await client.updateConfig(id, input); await listConfigs(); return c; } catch { return null; }
  }, []);

  const deleteConfig = useCallback(async (id: string): Promise<void> => {
    try { await client.deleteConfig(id); await listConfigs(); } catch { /* ignore */ }
  }, []);

  const listFlags = useCallback(async () => {
    setFlagsLoading(true);
    try { setFeatureFlags(await client.listFlags()); } finally { setFlagsLoading(false); }
  }, []);

  const evaluateFlag = useCallback(async (id: string, context?: any): Promise<FeatureFlagEvaluation> => {
    return client.evaluateFlag(id, context);
  }, []);

  const listEnvironments = useCallback(async () => {
    setEnvsLoading(true);
    try { setEnvironments(await client.listEnvironments()); } finally { setEnvsLoading(false); }
  }, []);

  const loadBrand = useCallback(async () => {
    setBrandLoading(true);
    try { setBrand(await client.getBrand()); } finally { setBrandLoading(false); }
  }, []);

  const loadBlockchain = useCallback(async () => {
    try { setBlockchain(await client.listBlockchainConfigs()); } catch { /* ignore */ }
  }, []);

  const loadAi = useCallback(async () => {
    try { setAi(await client.listAiConfigs()); } catch { /* ignore */ }
  }, []);

  const resolveValue = useCallback(async (key: string, environmentId: string) => {
    try { setResolvedValue(await client.getResolved(key, environmentId)); } catch { setResolvedValue(undefined); }
  }, []);

  const loadAudit = useCallback(async (configId?: string) => {
    try { setAudit(await client.listAudit(configId)); } catch { /* ignore */ }
  }, []);

  useEffect(() => { listConfigs(); listFlags(); listEnvironments(); }, []);

  return {
    configs, configsLoading, configsError, listConfigs,
    getConfig, createConfig, updateConfig, deleteConfig,
    featureFlags, flagsLoading, listFlags, evaluateFlag,
    environments, envsLoading, listEnvironments,
    brand, brandLoading, loadBrand,
    blockchain, loadBlockchain, ai, loadAi,
    resolvedValue, resolveValue,
    audit, loadAudit,
    client,
  };
}