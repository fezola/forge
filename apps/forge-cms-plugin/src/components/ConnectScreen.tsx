import { useState } from "react";
import { framer } from "framer-plugin";
import { ForgeApiClient } from "../lib/forge-api";
import type { ForgeConnectionConfig, ForgeTable } from "../types/forge";

interface ConnectScreenProps {
  onConnected: (client: ForgeApiClient, tables: ForgeTable[], config: ForgeConnectionConfig) => void;
}

export function ConnectScreen({ onConnected }: ConnectScreenProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("forgeApiKey") || "");
  const [projectId, setProjectId] = useState(() => localStorage.getItem("forgeProjectId") || "");
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem("forgeBaseUrl") || "http://localhost:3001");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    if (!apiKey.trim() || !projectId.trim()) {
      setError("API Key and Project ID are required");
      return;
    }

    setConnecting(true);
    const config: ForgeConnectionConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      baseUrl: baseUrl.trim(),
    };

    const client = new ForgeApiClient(config);
    const ok = await client.verifyConnection();

    if (!ok) {
      setError("Could not connect to Forge API. Check your credentials and base URL.");
      setConnecting(false);
      return;
    }

    const tables = await client.getTables();

    localStorage.setItem("forgeApiKey", config.apiKey);
    localStorage.setItem("forgeProjectId", config.projectId);
    localStorage.setItem("forgeBaseUrl", config.baseUrl);

    framer.showUI({ width: 400, height: 500, resizable: true });
    onConnected(client, tables, config);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
        Connect to Forge
      </h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "#666" }}>
          API Key
        </label>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Forge API key"
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "#666" }}>
          Project ID
        </label>
        <input
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="Enter your project ID"
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "#666" }}>
          Forge API URL
        </label>
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="http://localhost:3001"
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div role="button" onClick={handleConnect} style={{
        width: "100%",
        padding: "10px 0",
        background: connecting ? "#a5b4fc" : "#6366f1",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        textAlign: "center",
        cursor: connecting ? "not-allowed" : "pointer",
      }}>
        {connecting ? "Connecting..." : "Connect"}
      </div>
    </div>
  );
}