import { useState } from "react";
import { ComponentBrowser } from "./ComponentBrowser";
import { PaymentsPage } from "./PaymentsPage";
import { Grid, DollarSign } from "../ui/icons";

export function ForgeCanvas() {
  const [tab, setTab] = useState<"components" | "payments">("payments");

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: "100%", display: "flex", flexDirection: "column",
      background: "#fff", color: "#111", fontSize: 13,
    }}>
      {/* Top bar — equal width buttons */}
      <div style={{
        height: 36, display: "flex", alignItems: "stretch",
        borderBottom: "1px solid #eee", flexShrink: 0,
      }}>
        {(["components", "payments"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, border: "none", cursor: "pointer",
                background: "transparent", fontSize: 12, fontFamily: "inherit",
                fontWeight: active ? 600 : 450,
                color: active ? "#111" : "#888",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                borderBottom: active ? "2px solid #111" : "2px solid transparent",
              }}
            >
              {t === "components" ? <Grid size={12} /> : <DollarSign size={12} />}
              {t === "components" ? "Components" : "Payments"}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {tab === "components" ? <ComponentBrowser /> : <PaymentsPage />}
      </div>
    </div>
  );
}
