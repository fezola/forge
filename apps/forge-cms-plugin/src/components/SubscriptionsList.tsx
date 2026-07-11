import { useState, useMemo } from "react";
import { PaymentSubscription, SubscriptionStatus } from "../types/payments";
import { Search, Repeat } from "../ui/icons";

interface Props { subscriptions: PaymentSubscription[] }

const STATUS_COLORS: Record<SubscriptionStatus, { bg: string; color: string }> = {
  active: { bg: "#dcfce7", color: "#166534" },
  trialing: { bg: "#e0e7ff", color: "#3730a3" },
  past_due: { bg: "#fef3c7", color: "#92400e" },
  canceled: { bg: "#f3f4f6", color: "#6b7280" },
  expired: { bg: "#f3f4f6", color: "#9ca3af" },
  incomplete: { bg: "#fce7f3", color: "#be185d" },
  paused: { bg: "#fff7ed", color: "#c2410c" },
};

const inputStyle: React.CSSProperties = {
  padding: "7px 10px", border: "1.5px solid #eee", borderRadius: 8,
  fontSize: 13, color: "#111", outline: "none", background: "#f7f7f7",
  fontFamily: "inherit", boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  padding: "7px 10px", border: "1.5px solid #eee", borderRadius: 8,
  fontSize: 12, color: "#555", outline: "none", background: "#fff",
  fontFamily: "inherit", appearance: "none", WebkitAppearance: "none",
  cursor: "pointer", minWidth: 120,
};

export function SubscriptionsList({ subscriptions }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.customerName.toLowerCase().includes(q) && !s.productName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [subscriptions, search, statusFilter]);

  const statusBadge = (status: SubscriptionStatus) => {
    const c = STATUS_COLORS[status];
    return (
      <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: c.bg, color: c.color, lineHeight: "18px", textTransform: "capitalize" }}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Subscriptions</div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>{subscriptions.length} total subscriptions</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or product..." style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
            onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.background = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#eee"; if (!search) e.target.style.background = "#f7f7f7"; }}
          />
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", pointerEvents: "none" }}>
            <Search size={13} />
          </div>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | "all")} style={selectStyle}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, overflowX: "auto" }}>
        <div style={{ display: "flex", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <div style={{ flex: 2 }}>Customer</div>
          <div style={{ flex: 1.5 }}>Product</div>
          <div style={{ flex: 1 }}>Amount</div>
          <div style={{ flex: 1 }}>Status</div>
          <div style={{ flex: 1 }}>Next billing</div>
        </div>
        {filtered.map((s) => (
          <div key={s.id} style={{ display: "flex", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 12.5 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fafafa"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ flex: 2 }}>
              <span style={{ fontWeight: 500 }}>{s.customerName}</span>
              <span style={{ fontSize: 11, color: "#999", display: "block" }}>{s.customerEmail}</span>
            </div>
            <div style={{ flex: 1.5, color: "#555" }}>{s.productName}</div>
            <div style={{ flex: 1, fontWeight: 600 }}>${(s.amount / 100).toFixed(2)}/{s.interval}</div>
            <div style={{ flex: 1 }}>{statusBadge(s.status)}</div>
            <div style={{ flex: 1, color: "#888", fontSize: 11 }}>
              {new Date(s.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
            No subscriptions match your filters
          </div>
        )}
      </div>
    </div>
  );
}
