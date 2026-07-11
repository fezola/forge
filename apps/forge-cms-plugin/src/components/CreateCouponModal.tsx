import { useState } from "react";
import { Modal } from "./Modal";
import { usePayments } from "../hooks/usePayments";

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", border: "1.5px solid #eee", borderRadius: 8,
  fontSize: 13, color: "#111", outline: "none", background: "#fff",
  fontFamily: "inherit", boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: "none", WebkitAppearance: "none", cursor: "pointer",
};

export function CreateCouponModal({ open, onClose }: Props) {
  const { addCoupon } = usePayments();
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");

  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const now = new Date();
    const until = new Date();
    until.setMonth(until.getMonth() + 1);

    addCoupon({
      id: `coup_${Date.now()}`,
      code: (form.get("code") as string) || generateCode(),
      type: form.get("discountType") as "percentage" | "fixed",
      value: Number(form.get("value")) || 0,
      appliesTo: "all",
      maxRedemptions: Number(form.get("maxRedemptions")) || 1000,
      timesRedeemed: 0,
      minOrderAmount: Number(form.get("minOrder")) * 100 || 0,
      duration: (form.get("duration") as "forever" | "once" | "limited") || "once",
      durationMonths: Number(form.get("durationMonths")) || 0,
      activeFrom: now.toISOString(),
      activeUntil: until.toISOString(),
      isActive: true,
      createdAt: now.toISOString(),
    });

    setSubmitting(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Coupon" width={500}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label>Coupon Code</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <input name="code" placeholder="SUMMER2026" style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={(e) => { const inp = (e.target as HTMLElement).parentElement?.querySelector('[name="code"]') as HTMLInputElement; if (inp) inp.value = generateCode(); }} style={{ padding: "8px 14px", border: "1.5px solid #eee", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", background: "#fff", color: "#555", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              Generate
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Discount Type</Label>
            <select name="discountType" value={discountType} onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")} style={selectStyle}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div style={{ width: 140 }}>
            <Label>Value</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input name="value" type="number" step="0.01" placeholder="25" style={inputStyle} />
              <span style={{ fontSize: 12, color: "#999" }}>{discountType === "percentage" ? "%" : "$"}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Max Redemptions</Label>
            <input name="maxRedemptions" type="number" placeholder="1000" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Min Order Amount ($)</Label>
            <input name="minOrder" type="number" step="0.01" placeholder="10" style={inputStyle} />
          </div>
        </div>

        <div>
          <Label>Duration</Label>
          <select name="duration" style={selectStyle}>
            <option value="once">Once per customer</option>
            <option value="forever">Forever</option>
            <option value="limited">Limited cycles</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 18px", border: "1.5px solid #eee", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#fff", color: "#555", fontFamily: "inherit" }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ padding: "8px 18px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#111", color: "#fff", fontFamily: "inherit", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Creating..." : "Create Coupon"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 600, color: "#888", marginBottom: 5 }}>{children}</div>;
}
