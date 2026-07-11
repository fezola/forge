import { useState, useMemo } from "react";
import { PaymentInvoice } from "../types/payments";
import { Search, FileText } from "../ui/icons";

interface Props { invoices: PaymentInvoice[] }

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#dcfce7", color: "#166534" },
  open: { bg: "#e0e7ff", color: "#3730a3" },
  draft: { bg: "#f3f4f6", color: "#6b7280" },
  void: { bg: "#fce7e7", color: "#991b1b" },
  uncollectible: { bg: "#fef3c7", color: "#92400e" },
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

export function InvoicesList({ invoices }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!inv.number.toLowerCase().includes(q) && !inv.customerName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [invoices, search, statusFilter]);

  const statusBadge = (status: string) => {
    const c = STATUS_COLORS[status] ?? { bg: "#f3f4f6", color: "#6b7280" };
    return (
      <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: c.bg, color: c.color, lineHeight: "18px", textTransform: "capitalize" }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Invoices</div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>{invoices.length} total invoices</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or customer..." style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
            onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.background = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#eee"; if (!search) e.target.style.background = "#f7f7f7"; }}
          />
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", pointerEvents: "none" }}>
            <Search size={13} />
          </div>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="open">Open</option>
          <option value="draft">Draft</option>
          <option value="void">Void</option>
          <option value="uncollectible">Uncollectible</option>
        </select>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, overflowX: "auto" }}>
        <div style={{ display: "flex", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <div style={{ flex: 1.5 }}>Invoice</div>
          <div style={{ flex: 2 }}>Customer</div>
          <div style={{ flex: 1 }}>Amount</div>
          <div style={{ flex: 1 }}>Status</div>
          <div style={{ flex: 1 }}>Due</div>
        </div>
        {filtered.map((inv) => (
          <div key={inv.id} style={{ display: "flex", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 12.5 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fafafa"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ flex: 1.5, fontWeight: 500 }}>{inv.number}</div>
            <div style={{ flex: 2 }}>{inv.customerName}</div>
            <div style={{ flex: 1, fontWeight: 600 }}>${(inv.amount / 100).toFixed(2)}</div>
            <div style={{ flex: 1 }}>{statusBadge(inv.status)}</div>
            <div style={{ flex: 1, color: "#888", fontSize: 11 }}>
              {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
            No invoices match your filters
          </div>
        )}
      </div>
    </div>
  );
}
