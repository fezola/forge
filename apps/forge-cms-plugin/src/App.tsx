import { useState, useLayoutEffect } from "react";
import { framer, FramerPluginClosedError } from "framer-plugin";
import "framer-plugin/framer.css";
import { ConnectScreen } from "./components/ConnectScreen";
import { TableSelect } from "./components/TableSelect";
import { SyncScreen } from "./components/SyncScreen";
import { ForgeCanvas } from "./components/ForgeCanvas";
import { ForgeApiClient } from "./lib/forge-api";
import { syncCollection } from "./lib/sync";
import type {
  ForgeConnectionConfig,
  ForgeTable,
  FieldMapping,
} from "./types/forge";
import { PLUGIN_STORAGE_KEYS } from "./types/forge";

type Screen = "canvas" | "connect" | "tableSelect" | "sync";

export function App() {
  const [screen, setScreen] = useState<Screen>("connect");
  const [client, setClient] = useState<ForgeApiClient | null>(null);
  const [connectionConfig, setConnectionConfig] =
    useState<ForgeConnectionConfig | null>(null);
  const [tables, setTables] = useState<ForgeTable[]>([]);
  const [currentTableId, setCurrentTableId] = useState<string>("");
  const [currentMappings, setCurrentMappings] = useState<FieldMapping[]>([]);

  useLayoutEffect(() => {
    async function init() {
      if (framer.mode === "canvas") {
        framer.showUI({ width: 820, height: 600, resizable: true });
        setScreen("canvas");
        return;
      }

      const collection = await framer.getActiveManagedCollection();

      if (framer.mode === "syncManagedCollection") {
        const storedConfig = await collection.getPluginData(
          PLUGIN_STORAGE_KEYS.CONNECTION
        );
        const storedMapping = await collection.getPluginData(
          PLUGIN_STORAGE_KEYS.COLLECTION_CONFIG
        );

        if (storedConfig && storedMapping) {
          const cfg: ForgeConnectionConfig = JSON.parse(storedConfig);
          const map: { tableId: string; mappings: FieldMapping[] } =
            JSON.parse(storedMapping);

          if (!framer.isAllowedTo(
            "ManagedCollection.setFields",
            "ManagedCollection.addItems",
            "ManagedCollection.removeItems",
            "ManagedCollection.setPluginData"
          )) {
            framer.closePlugin("Insufficient permissions", {
              variant: "error",
            });
            return;
          }

          await framer.hideUI();

          const forgeClient = new ForgeApiClient(cfg);
          try {
            const rows = await forgeClient.getRows(map.tableId);
            const result = await syncCollection(
              collection,
              rows,
              map.mappings
            );
            const msg = [
              `Synced ${rows.length} items`,
              result.added > 0 ? `(+${result.added} new)` : "",
              result.removed > 0 ? `(-${result.removed} removed)` : "",
            ]
              .filter(Boolean)
              .join(" ");
            framer.closePlugin(msg, { variant: "success" });
          } catch (error) {
            if (error instanceof FramerPluginClosedError) return;
            framer.closePlugin(String(error), { variant: "error" });
          }
          return;
        }
      }

      framer.showUI({ width: 400, height: 480, resizable: true });

      const savedKey = localStorage.getItem("forgeApiKey");
      const savedProjectId = localStorage.getItem("forgeProjectId");
      const savedUrl = localStorage.getItem("forgeBaseUrl");

      if (savedKey && savedProjectId) {
        const cfg: ForgeConnectionConfig = {
          apiKey: savedKey,
          projectId: savedProjectId,
          baseUrl: savedUrl || "http://localhost:3001",
        };
        const c = new ForgeApiClient(cfg);
        const ok = await c.verifyConnection();
        if (ok) {
          setClient(c);
          setConnectionConfig(cfg);
          const tables = await c.getTables();
          setTables(tables);
          setScreen("tableSelect");
        }
      }
    }

    init().catch((error) => {
      if (error instanceof FramerPluginClosedError) return;
      console.error(error);
    });
  }, []);

  async function handleConnected(
    c: ForgeApiClient,
    t: ForgeTable[],
    cfg: ForgeConnectionConfig
  ) {
    setClient(c);
    setConnectionConfig(cfg);
    setTables(t);
    setScreen("tableSelect");
  }

  async function handleConfigured(
    mappings: FieldMapping[],
    slugFieldId: string
  ) {
    if (!client || !connectionConfig || !tables.length) return;

    const collection = await framer.getActiveManagedCollection();
    const tableId = tables.find((t) =>
      mappings.some((m) => m.forgeFieldId)
    )?.id;

    if (!tableId) return;

    const configPayload = JSON.stringify({ tableId, mappings });
    const connPayload = JSON.stringify(connectionConfig);

    await collection.setPluginData(
      PLUGIN_STORAGE_KEYS.CONNECTION,
      connPayload
    );
    await collection.setPluginData(
      PLUGIN_STORAGE_KEYS.COLLECTION_CONFIG,
      configPayload
    );
    await collection.setPluginData(
      PLUGIN_STORAGE_KEYS.LAST_SYNCED,
      new Date().toISOString()
    );

    await collection.setAsActive();
    setCurrentTableId(tableId);
    setCurrentMappings(mappings);

    if (framer.mode === "configureManagedCollection") {
      await doInitialSync(collection, client, tableId, mappings);
    }
  }

  async function doInitialSync(
    collection: Awaited<ReturnType<typeof framer.getActiveManagedCollection>>,
    forgeClient: ForgeApiClient,
    tableId: string,
    mappings: FieldMapping[]
  ) {
    framer.setCloseWarning("Initial sync in progress...");
    try {
      const rows = await forgeClient.getRows(tableId);
      const result = await syncCollection(collection, rows, mappings);
      const message = [
        `Collection configured.`,
        result.added > 0 ? ` ${result.added} items synced.` : " Ready.",
      ].join("");
      framer.closePlugin(message, { variant: "success" });
    } catch (error) {
      if (error instanceof FramerPluginClosedError) return;
      framer.closePlugin(String(error), { variant: "error" });
    } finally {
      framer.setCloseWarning(false);
    }
  }

  if (screen === "sync" && client && currentMappings.length > 0) {
    return (
      <SyncScreen
        client={client}
        config={connectionConfig!}
        tableId={currentTableId}
        mappings={currentMappings}
      />
    );
  }

  if (screen === "tableSelect" && client) {
    return (
      <TableSelect
        client={client}
        tables={tables}
        onConfigured={handleConfigured}
      />
    );
  }

  if (screen === "canvas") {
    return <ForgeCanvas />;
  }

  return <ConnectScreen onConnected={handleConnected} />;
}