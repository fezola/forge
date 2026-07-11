import { useState } from "react";
import { Modal } from "./Modal";
import { PaymentTransaction } from "../types/payments";
import { usePayments } from "../hooks/usePayments";

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", border: "1.5px solid #eee", borderRadius: 8,
  fontSize: 13, color: "#111", outline: "none", background: "#fff",
  fontFamily: "inherit", boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: "none", WebkitAppearance: "none", cursor: "pointer",
};

export function IssueRefundModal({ open, onClose, transaction }: Props) {
  const { addRefund, updateTransaction } = usePayments();
  const [submitting, setSubmitting] = useState(false);
  const [fullRefund, setFullRefund] = useState(true);
  const [partialAmount, setPartialAmount] = useState("");

  if (!transaction) return null;
  const tx = transaction;

  const maxAmount = tx.amount;
  const refundAmount = fullRefund ? maxAmount : Math.min(Number(partialAmount) * 100 || 0, maxAmount);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const amount = fullRefund ? maxAmount : Math.min(Number(form.get("partialAmount")) * 100 || 0, maxAmount);

    addRefund({
      id: `rfnd_${Date.now()}`,
      transactionId: tx.id,
      amount,
      currency: tx.currency,
      reason: (form.get("reason") as string) || "customer_request",
      status: "succeeded",
      notes: (form.get("notes") as string) || "",
      createdAt: new Date().toISOString(),
    });

    updateTransaction(tx.id, {
      status: amount === maxAmount ? "refunded" : "partially_refunded",
    });

    setSubmitting(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Issue Refund" width={500}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #eee" }}>
        <InfoRow label="Transaction" value={tx.id} />
        <InfoRow label="Customer" value={tx.customerName} />
        <InfoRow label="Product" value={tx.productName} />
        <InfoRow label="Original Amount" value={`$${(tx.amount / 100).toFixed(2)}`} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label>Refund Amount</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer" }}>
              <input type="radio" checked={fullRefund} onChange={() => setFullRefund(true)} style={{ accentColor: "#111" }} />
              Full refund (${(maxAmount / 100).toFixed(2)})
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer" }}>
              <input type="radio" checked={!fullRefund} onChange={() => setFullRefund(false)} style={{ accentColor: "#111" }} />
              Partial
            </label>
          </div>
          {!fullRefund && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>$</span>
              <input
                name="partialAmount"
                type="number"
                step="0.01"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder={(maxAmount / 100).toFixed(2)}
                style={{ ...inputStyle, width: 140 }}
              />
              <span style={{ fontSize: 12, color: "#999" }}>of ${(maxAmount / 100).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div>
          <Label>Reason</Label>
          <select name="reason" style={selectStyle}>
            <option value="customer_request">Customer request</option>
            <option value="duplicate">Duplicate charge</option>
            <option value="product_issue">Product issue</option>
            <option value="fraud">Fraud suspect</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <Label>Notes (internal)</Label>
          <input name="notes" placeholder="Optional notes" style={inputStyle} />
        </div>

        <div style={{ fontSize: 11.5, color: "#dc2626", background: "#fce7e7", borderRadius: 8, padding: "8px 12px" }}>
          ⚠️ Refunding ${(refundAmount / 100).toFixed(2)} will revoke access to this product.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 18px", border: "1.5px solid #eee", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#fff", color: "#555", fontFamily: "inherit" }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ padding: "8px 18px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#dc2626", color: "#fff", fontFamily: "inherit", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Processing..." : `Issue Refund — $${(refundAmount / 100).toFixed(2)}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 600, color: "#888", marginBottom: 5 }}>{children}</div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
