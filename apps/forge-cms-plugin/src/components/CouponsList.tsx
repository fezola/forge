import { useState, useMemo } from "react";
import { PaymentCoupon } from "../types/payments";
import { Search, TicketPercent } from "../ui/icons";

interface Props { coupons: PaymentCoupon[] }

const inputStyle: React.CSSProperties = {
  padding: "7px 10px 7px 32px", border: "1.5px solid #eee", borderRadius: 8,
  fontSize: 13, color: "#111", outline: "none", background: "#f7f7f7",
  fontFamily: "inherit", boxSizing: "border-box", width: "100%",
};

export function CouponsList({ coupons }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return coupons;
    const q = search.toLowerCase();
    return coupons.filter((c) => c.code.toLowerCase().includes(q));
  }, [coupons, search]);

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Coupons</div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>{coupons.length} total coupons</div>
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 400 }}>
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", pointerEvents: "none" }}>
          <Search size={13} />
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code..." style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.background = "#fff"; }}
          onBlur={(e) => { e.target.style.borderColor = "#eee"; if (!search) e.target.style.background = "#f7f7f7"; }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((c) => (
          <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: "12px 16px", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef3c7", color: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TicketPercent size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "monospace" }}>{c.code}</span>
                <span style={{ padding: "1px 7px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: c.isActive ? "#dcfce7" : "#f3f4f6", color: c.isActive ? "#166534" : "#6b7280", lineHeight: "18px" }}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: "#999", marginTop: 2 }}>
                {c.type === "percentage" ? `${c.value}% off` : `$${c.value.toFixed(2)} off`} &middot; {c.timesRedeemed}/{c.maxRedemptions} used &middot; {new Date(c.activeFrom).toLocaleDateString()} – {new Date(c.activeUntil).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
          <div style={{ opacity: 0.3, marginBottom: 12 }}><TicketPercent size={24} /></div>
          {search ? "No coupons match your search" : "No coupons yet"}
        </div>
      )}
    </div>
  );
}
