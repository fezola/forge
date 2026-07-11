import { PaymentRefund } from "../types/payments";
import { RotateCcw, CheckCircle, AlertCircle, Clock } from "../ui/icons";

interface Props { refunds: PaymentRefund[] }

export function RefundsList({ refunds }: Props) {
  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Refunds</div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>{refunds.length} total refunds</div>
      {refunds.length === 0 ? (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
          <div style={{ opacity: 0.3, marginBottom: 12 }}><RotateCcw size={24} /></div>
          No refunds processed
        </div>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflowX: "auto" }}>
          <div style={{ display: "flex", padding: "10px 16px", background: "#fafafa", borderBottom: "1px solid #eee", fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <div style={{ flex: 1.5 }}>Transaction</div>
            <div style={{ flex: 1 }}>Amount</div>
            <div style={{ flex: 1.5 }}>Reason</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ flex: 1 }}>Date</div>
          </div>
          {refunds.map((r) => (
            <div key={r.id} style={{ display: "flex", padding: "12px 16px", borderBottom: "1px solid #f5f5f5", alignItems: "center", fontSize: 12.5 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fafafa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ flex: 1.5, fontWeight: 500 }}>{r.transactionId}</div>
              <div style={{ flex: 1, fontWeight: 600 }}>${(r.amount / 100).toFixed(2)}</div>
              <div style={{ flex: 1.5, color: "#555", fontSize: 11.5, textTransform: "capitalize" }}>{r.reason.replace("_", " ")}</div>
              <div style={{ flex: 1 }}>
                {r.status === "succeeded" ? (
                  <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: "#dcfce7", color: "#166534", lineHeight: "18px" }}>Completed</span>
                ) : r.status === "pending" ? (
                  <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: "#fef3c7", color: "#92400e", lineHeight: "18px" }}>Pending</span>
                ) : (
                  <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: "#fce7e7", color: "#991b1b", lineHeight: "18px" }}>Failed</span>
                )}
              </div>
              <div style={{ flex: 1, color: "#888", fontSize: 11 }}>
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
