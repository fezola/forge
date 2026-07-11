import { useState, useCallback, useEffect } from "react";
import {
  ForgeGlobalConfig,
  DEFAULT_CONFIG,
  FORGE_CONFIG_KEY,
} from "../types/forge-config";

function loadConfig(): ForgeGlobalConfig {
  try {
    const raw = localStorage.getItem(FORGE_CONFIG_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_CONFIG };
}

export function useForgeConfig() {
  const [config, setConfig] = useState<ForgeGlobalConfig>(loadConfig);

  useEffect(() => {
    localStorage.setItem(FORGE_CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = useCallback((patch: Partial<ForgeGlobalConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const addProduct = useCallback(
    (product: ForgeGlobalConfig["products"][0]) => {
      setConfig((prev) => ({
        ...prev,
        products: [...prev.products, product],
      }));
    },
    []
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<ForgeGlobalConfig["products"][0]>) => {
      setConfig((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      }));
    },
    []
  );

  const removeProduct = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  }, []);

  return { config, updateConfig, addProduct, updateProduct, removeProduct };
}
