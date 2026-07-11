import { useState } from "react";
import { framer } from "framer-plugin";
import { ForgeApiClient } from "../lib/forge-api";
import type { ForgeTable, ForgeField, FieldMapping } from "../types/forge";
import { forgeToFramerType, FRAMER_FIELD_TYPES } from "../types/forge";

interface TableSelectProps {
  client: ForgeApiClient;
  tables: ForgeTable[];
  onConfigured: (mappings: FieldMapping[], slugFieldId: string) => void;
}

export function TableSelect({ client, tables, onConfigured }: TableSelectProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [fields, setFields] = useState<ForgeField[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [slugField, setSlugField] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleTableChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tableId = e.target.value;
    setSelectedTable(tableId);
    setLoading(true);
    const tableFields = await client.getTableFields(tableId);
    setFields(tableFields);
    setSlugField(tableFields[0]?.id || "");
    setMappings(
      tableFields.map((f) => ({
        forgeFieldId: f.id,
        cmsFieldId: f.id,
        cmsFieldName: f.name,
        cmsFieldType: forgeToFramerType(f.type),
      }))
    );
    setLoading(false);
  }

  function updateMapping(index: number, updates: Partial<FieldMapping>) {
    setMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updates } : m))
    );
  }

  async function handleConfigure() {
    const table = tables.find((t) => t.id === selectedTable);
    if (!table) return;

    await framer.setCloseWarning("Configuring Forge CMS collection...");
    try {
      onConfigured(mappings, slugField);
    } finally {
      await framer.setCloseWarning(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
        Select Data Table
      </h2>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "#666" }}>
          Forge Table
        </label>
        <select
          value={selectedTable || ""}
          onChange={handleTableChange}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 14,
            boxSizing: "border-box",
            background: "white",
          }}
        >
          <option value="">Select a table...</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} {t.itemCount != null ? `(${t.itemCount} items)` : ""}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ color: "#666", fontSize: 14 }}>Loading fields...</div>
      ) : fields.length > 0 ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 4, color: "#666" }}>
              Slug Field
            </label>
            <select
              value={slugField}
              onChange={(e) => setSlugField(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
                background: "white",
              }}
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Field Mapping
          </h3>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
            Map Forge fields to Framer CMS field types
          </p>

          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {fields.map((field, index) => (
              <div
                key={field.id}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                  {field.name}
                  <span style={{ color: "#999", marginLeft: 4, fontWeight: 400 }}>
                    ({field.type})
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={mappings[index]?.cmsFieldName || ""}
                    onChange={(e) => updateMapping(index, { cmsFieldName: e.target.value })}
                    placeholder="CMS field name"
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                  />
                  <select
                    value={mappings[index]?.cmsFieldType || "string"}
                    onChange={(e) => updateMapping(index, { cmsFieldType: e.target.value })}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      fontSize: 13,
                      background: "white",
                    }}
                  >
                    {FRAMER_FIELD_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>
                        {ft.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div
            role="button"
            onClick={handleConfigure}
            style={{
              width: "100%",
              padding: "10px 0",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
              cursor: "pointer",
              marginTop: 20,
            }}
          >
            Configure Collection
          </div>
        </>
      ) : null}
    </div>
  );
}