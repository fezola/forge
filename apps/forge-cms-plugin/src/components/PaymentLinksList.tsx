import { PaymentLink } from "../types/payments";
import { Link, Copy, BarChart3 } from "../ui/icons";

interface Props { paymentLinks: PaymentLink[] }

export function PaymentLinksList({ paymentLinks }: Props) {
  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Payment Links</div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>{paymentLinks.length} total payment links</div>
      {paymentLinks.length === 0 ? (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
          <div style={{ opacity: 0.3, marginBottom: 12 }}><Link size={24} /></div>
          No payment links yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {paymentLinks.map((pl) => (
            <div key={pl.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e0e7ff", color: "#3730a3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Link size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{pl.name}</div>
                <div style={{ fontSize: 11.5, color: "#6366f1", fontFamily: "monospace" }}>{pl.url}</div>
              </div>
              <div style={{ display: "flex", gap: 12, textAlign: "center" }}>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{pl.views}</div><div style={{ fontSize: 10, color: "#999" }}>views</div></div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{pl.checkouts}</div><div style={{ fontSize: 10, color: "#999" }}>checkouts</div></div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>${(pl.revenue / 100).toFixed(2)}</div><div style={{ fontSize: 10, color: "#999" }}>revenue</div></div>
              </div>
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: pl.isActive ? "#dcfce7" : "#f3f4f6", color: pl.isActive ? "#166534" : "#6b7280", lineHeight: "18px" }}>
                {pl.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
