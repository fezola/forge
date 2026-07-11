import { PaymentWebhook } from "../types/payments";
import { Activity, Copy, CheckCircle, AlertCircle } from "../ui/icons";

interface Props { webhooks: PaymentWebhook[] }

export function WebhooksList({ webhooks }: Props) {
  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Webhooks</div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>{webhooks.length} total webhooks</div>
      {webhooks.length === 0 ? (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
          <div style={{ opacity: 0.3, marginBottom: 12 }}><Activity size={24} /></div>
          No webhooks configured
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {webhooks.map((w) => (
            <div key={w.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: "14px 16px", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Activity size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{w.description || "Webhook"}</div>
                  <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "monospace" }}>{w.url}</div>
                </div>
                <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: w.isActive ? "#dcfce7" : "#f3f4f6", color: w.isActive ? "#166534" : "#6b7280", lineHeight: "18px" }}>
                  {w.isActive ? "Active" : "Inactive"}
                </span>
                {w.lastDeliveryStatus === "success"
                  ? <CheckCircle size={16} style={{ color: "#16a34a" }} />
                  : <AlertCircle size={16} style={{ color: "#dc2626" }} />
                }
              </div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                Events: {w.events.join(", ")} &middot; Last delivery: {w.lastDeliveryAt ? new Date(w.lastDeliveryAt).toLocaleString() : "Never"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
