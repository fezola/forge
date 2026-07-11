import type { ForgeConnectionConfig, ForgeTable, ForgeField, ForgeRow } from "../types/forge";

export class ForgeApiClient {
  private config: ForgeConnectionConfig;

  constructor(config: ForgeConnectionConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.config.baseUrl}/api/v1/projects/${this.config.projectId}${path}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || error.error || `Request failed: ${response.status}`);
    }
    return response.json();
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.request<{ data: unknown }>("/databases");
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<ForgeTable[]> {
    const result = await this.request<{ data: ForgeTable[] }>("/databases");
    return result.data || [];
  }

  async getTableFields(tableId: string): Promise<ForgeTable["fields"]> {
    const result = await this.request<{ data: ForgeTable }>(`/databases/${tableId}`);
    return result.data?.fields || [];
  }

  async getRows(tableId: string): Promise<ForgeRow[]> {
    const result = await this.request<{ data: ForgeRow[] }>(`/databases/${tableId}/rows`);
    return result.data || [];
  }
}