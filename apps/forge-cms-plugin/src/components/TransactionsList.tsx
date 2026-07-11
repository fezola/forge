import { useState, useMemo } from "react";
import { PaymentTransaction, PaymentStatus } from "../types/payments";
import { Search, CreditCard } from "../ui/icons";
import { TransactionDetail } from "./TransactionDetail";

interface Props {
  transactions: PaymentTransaction[];
}

const STATUS_COLORS: Record<PaymentStatus, { bg: string; color: string }> = {
  succeeded: { bg: "#dcfce7", color: "#166534" },
  pending: { bg: "#fef3c7", color: "#92400e" },
  failed: { bg: "#fce7e7", color: "#991b1b" },
  refunded: { bg: "#e0e7ff", color: "#3730a3" },
  partially_refunded: { bg: "#f3e8ff", color: "#6b21a8" },
};

export function TransactionsList({ transactions }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !tx.customerName.toLowerCase().includes(q) &&
          !tx.customerEmail.toLowerCase().includes(q) &&
          !tx.productName.toLowerCase().includes(q) &&
          !tx.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [transactions, search, statusFilter]);

  const containerStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: "#111",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    fontSize: 13,
  };

  const inputStyle: React.CSSProperties = {
    padding: "7px 10px 7px 32px",
    border: "1.5px solid #eee",
    borderRadius: 8,
    fontSize: 13,
    color: "#111",
    outline: "none",
    background: "#f7f7f7",
    fontFamily: "inherit",
    boxSizing: "border-box",
    width: "100%",
  };

  const selectStyle: React.CSSProperties = {
    padding: "7px 10px",
    border: "1.5px solid #eee",
    borderRadius: 8,
    fontSize: 12,
    color: "#555",
    outline: "none",
    background: "#fff",
    fontFamily: "inherit",
    appearance: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
    minWidth: 120,
  };

  const statusBadge = (status: PaymentStatus) => {
    const c = STATUS_COLORS[status];
    return (
      <span style={{
        padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500,
        background: c.bg, color: c.color, lineHeight: "18px",
        textTransform: "capitalize",
      }}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        Transactions
      </div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>
        {transactions.length} total transactions
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", pointerEvents: "none" }}>
            <Search size={13} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, product..."
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.background = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#eee"; if (!search) e.target.style.background = "#f7f7f7"; }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
          style={selectStyle}
        >
          <option value="all">All statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #eee", borderRadius: 12, overflowX: "auto" }}>
        <div style={{ display: "flex", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <div style={{ flex: 2 }}>Customer</div>
          <div style={{ flex: 1.5 }}>Product</div>
          <div style={{ flex: 1 }}>Amount</div>
          <div style={{ flex: 1 }}>Status</div>
          <div style={{ flex: 1 }}>Date</div>
        </div>
        {filtered.map((tx) => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(tx)}
            style={{
              display: "flex", padding: "12px 16px",
              borderBottom: "1px solid #f5f5f5",
              alignItems: "center",
              fontSize: 12.5,
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fafafa"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 500 }}>{tx.customerName}</span>
              <span style={{ fontSize: 11, color: "#999" }}>{tx.customerEmail}</span>
            </div>
            <div style={{ flex: 1.5, color: "#555" }}>{tx.productName}</div>
            <div style={{ flex: 1, fontWeight: 600 }}>${(tx.amount / 100).toFixed(2)}</div>
            <div style={{ flex: 1 }}>{statusBadge(tx.status)}</div>
            <div style={{ flex: 1, color: "#888", fontSize: 11 }}>
              {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
            No transactions match your filters
          </div>
        )}
      </div>

      <TransactionDetail transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}
