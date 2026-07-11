import type { ProviderAdapter, ProviderType } from "../types/providers";
import { MockProviderAdapter } from "./mockProviderAdapter";

type AdapterConstructor = new () => ProviderAdapter;

export class ProviderFactory {
  private adapters: Map<string, ProviderAdapter> = new Map();
  private constructors: Map<string, AdapterConstructor> = new Map();

  static initialize(): ProviderFactory {
    const factory = new ProviderFactory();
    factory.register("mock", MockProviderAdapter);
    return factory;
  }

  register(type: string, ctor: AdapterConstructor): void {
    this.constructors.set(type, ctor);
  }

  async createAndConnect(
    id: string,
    type: ProviderType,
    credentials: { apiKey?: string; environment: "test" | "live" }
  ): Promise<ProviderAdapter> {
    const Ctor = this.constructors.get(type);
    if (!Ctor) throw new Error(`Unknown provider type: ${type}`);

    const adapter = new Ctor();
    const result = await adapter.connect({
      apiKey: credentials.apiKey,
      environment: credentials.environment,
    });

    if (!result.success) {
      throw new Error(`Failed to connect ${type}: ${result.error}`);
    }

    this.adapters.set(id, adapter);
    return adapter;
  }

  get(id: string): ProviderAdapter | undefined {
    return this.adapters.get(id);
  }

  getAll(): ProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  remove(id: string): void {
    this.adapters.delete(id);
  }

  async disconnectAll(): Promise<void> {
    for (const adapter of this.adapters.values()) {
      await adapter.disconnect();
    }
    this.adapters.clear();
  }
}

export const providerFactory = ProviderFactory.initialize();
