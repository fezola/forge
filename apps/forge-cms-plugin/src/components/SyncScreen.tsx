import { useEffect } from "react";
import { framer, FramerPluginClosedError } from "framer-plugin";
import { ForgeApiClient } from "../lib/forge-api";
import { syncCollection } from "../lib/sync";
import type { FieldMapping, ForgeConnectionConfig } from "../types/forge";

interface SyncScreenProps {
  client: ForgeApiClient;
  config: ForgeConnectionConfig;
  tableId: string;
  mappings: FieldMapping[];
}

export function SyncScreen({ client, config, tableId, mappings }: SyncScreenProps) {
  useEffect(() => {
    let cancelled = false;

    async function doSync() {
      try {
        framer.setBackgroundMessage("Syncing Forge data...");
        framer.setCloseWarning("Sync in progress. Closing will cancel.");

        const rows = await client.getRows(tableId);

        if (cancelled) return;

        await framer.showUI({
          width: 360,
          height: 200,
          resizable: false,
        });

        const result = await syncCollection(
          await framer.getActiveManagedCollection(),
          rows,
          mappings
        );

        if (cancelled) return;

        const message = [
          `Sync complete:`,
          result.added > 0 ? ` +${result.added} added` : "",
          result.updated > 0 ? ` ~${result.updated} updated` : "",
          result.removed > 0 ? ` -${result.removed} removed` : "",
          result.errors > 0 ? ` ${result.errors} errors` : "",
        ]
          .filter(Boolean)
          .join("");

        await framer.setCloseWarning(false);
        framer.closePlugin(message, {
          variant: result.errors > 0 ? "warning" : "success",
        });
      } catch (error) {
        if (error instanceof FramerPluginClosedError) return;
        framer.closePlugin(String(error), { variant: "error" });
      }
    }

    doSync();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: 32,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Syncing Forge Data
      </div>
      <div style={{ fontSize: 14, color: "#666" }}>
        Fetching data from Forge and writing to Framer CMS...
      </div>
      <div style={{ marginTop: 16, color: "#6366f1", fontSize: 24 }}>
        {">"}
      </div>
    </div>
  );
}