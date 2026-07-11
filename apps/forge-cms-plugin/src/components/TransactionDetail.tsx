import { PaymentTransaction } from "../types/payments";
import { Drawer } from "./Drawer";

interface Props {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4,
};
const valueStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 500, color: "#111",
};
const sectionStyle: React.CSSProperties = {
  marginBottom: 20,
};

export function TransactionDetail({ transaction, onClose }: Props) {
  if (!transaction) return null;

  const statusColors: Record<string, { bg: string; color: string }> = {
    succeeded: { bg: "#dcfce7", color: "#166534" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    failed: { bg: "#fce7e7", color: "#991b1b" },
    refunded: { bg: "#e0e7ff", color: "#3730a3" },
    partially_refunded: { bg: "#f3e8ff", color: "#6b21a8" },
  };
  const sc = statusColors[transaction.status] ?? { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <Drawer open={!!transaction} onClose={onClose} title={`Transaction ${transaction.id}`}>
      {/* Status badge */}
      <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: sc.bg, color: sc.color, lineHeight: "20px", textTransform: "capitalize", marginBottom: 16, display: "inline-block" }}>
        {transaction.status.replace("_", " ")}
      </span>

      <div style={sectionStyle}>
        <div style={labelStyle}>Amount</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>
          ${(transaction.amount / 100).toFixed(2)}
          <span style={{ fontSize: 13, fontWeight: 400, color: "#999", marginLeft: 4 }}>
            {transaction.currency.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, ...sectionStyle }}>
        <div>
          <div style={labelStyle}>Customer</div>
          <div style={valueStyle}>{transaction.customerName}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{transaction.customerEmail}</div>
        </div>
        <div>
          <div style={labelStyle}>Product</div>
          <div style={valueStyle}>{transaction.productName}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{transaction.description}</div>
        </div>
        <div>
          <div style={labelStyle}>Payment Method</div>
          <div style={valueStyle}>{transaction.paymentMethod}</div>
        </div>
        <div>
          <div style={labelStyle}>Invoice</div>
          <div style={valueStyle}>{transaction.invoiceId || "—"}</div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Timeline</div>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <TimelineItem label="Payment created" time={transaction.createdAt} status="created" />
          <TimelineItem label="Payment {transaction.status === 'succeeded' ? 'completed' : transaction.status === 'failed' ? 'failed' : 'pending'}" time={transaction.updatedAt} status={transaction.status === 'succeeded' ? 'success' : transaction.status === 'failed' ? 'error' : 'pending'} />
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Actions</div>
        <div style={{ display: "flex", gap: 8 }}>
          <ActionBtn label="Issue Refund" />
          <ActionBtn label="View Invoice" />
          <ActionBtn label="Email Customer" />
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Raw Response</div>
        <pre style={{ background: "#f5f5f5", border: "1px solid #eee", borderRadius: 8, padding: 12, fontSize: 11, fontFamily: "monospace", color: "#666", overflow: "auto", maxHeight: 200, margin: 0 }}>
{JSON.stringify(transaction, null, 2)}
        </pre>
      </div>
    </Drawer>
  );
}

function TimelineItem({ label, time, status }: { label: string; time: string; status: "created" | "success" | "error" | "pending" }) {
  const dotColors: Record<string, string> = {
    created: "#6366f1",
    success: "#16a34a",
    error: "#dc2626",
    pending: "#d97706",
  };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColors[status], flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#999" }}>{new Date(time).toLocaleString()}</div>
      </div>
    </div>
  );
}

function ActionBtn({ label }: { label: string }) {
  return (
    <button
      style={{
        padding: "8px 14px", border: "1.5px solid #eee", borderRadius: 8,
        fontSize: 12, fontWeight: 500, cursor: "pointer", background: "#fff",
        color: "#555", fontFamily: "inherit", transition: "all 0.12s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4d4d4"; e.currentTarget.style.background = "#fafafa"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.background = "#fff"; }}
    >
      {label}
    </button>
  );
}
