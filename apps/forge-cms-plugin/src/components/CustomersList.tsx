import { useState, useMemo } from "react";
import { PaymentCustomer } from "../types/payments";
import { Search, Users, Mail, Phone, DollarSign } from "../ui/icons";
import { CustomerDetail } from "./CustomerDetail";

interface Props { customers: PaymentCustomer[] }

const inputStyle: React.CSSProperties = {
  padding: "7px 10px 7px 32px", border: "1.5px solid #eee", borderRadius: 8,
  fontSize: 13, color: "#111", outline: "none", background: "#f7f7f7",
  fontFamily: "inherit", boxSizing: "border-box", width: "100%",
};

export function CustomersList({ customers }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PaymentCustomer | null>(null);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Customers</div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>{customers.length} total customers</div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", pointerEvents: "none" }}>
          <Search size={13} />
        </div>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email..."
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.background = "#fff"; }}
          onBlur={(e) => { e.target.style.borderColor = "#eee"; if (!search) e.target.style.background = "#f7f7f7"; }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCustomer(c)}
            style={{
              border: "1px solid #eee", borderRadius: 12, padding: "14px 16px",
              background: "#fff", display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer",
              transition: "box-shadow 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg,#f5f5f5,#eee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 600, color: "#666", flexShrink: 0,
            }}>
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 3, fontSize: 11.5, color: "#999" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Mail size={11} /> {c.email}
                </span>
                {c.phone && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Phone size={11} /> {c.phone}
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>
                ${(c.totalSpent / 100).toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>{c.totalTransactions} txns</div>
            </div>
            <div style={{ fontSize: 11, color: "#bbb", minWidth: 80, textAlign: "right" }}>
              {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
          <div style={{ opacity: 0.3, marginBottom: 12 }}><Users size={24} /></div>
          {search ? "No customers match your search" : "No customers yet"}
        </div>
      )}

      <CustomerDetail customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  );
}
