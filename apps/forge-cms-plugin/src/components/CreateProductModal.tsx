import { useState } from "react";
import { Modal } from "./Modal";
import { ForgeProduct } from "../types/forge-config";
import { useForgeConfig } from "../hooks/useForgeConfig";

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

const btnPrimary: React.CSSProperties = {
  padding: "8px 18px", border: "none", borderRadius: 8, fontSize: 13,
  fontWeight: 500, cursor: "pointer", background: "#111", color: "#fff",
  fontFamily: "inherit",
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 18px", border: "1.5px solid #eee", borderRadius: 8, fontSize: 13,
  fontWeight: 500, cursor: "pointer", background: "#fff", color: "#555",
  fontFamily: "inherit",
};

export function CreateProductModal({ open, onClose }: Props) {
  const { addProduct } = useForgeConfig();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    addProduct({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name: (form.get("name") as string) || "",
      type: (form.get("type") as ForgeProduct["type"]) || "one-time",
      price: Number(form.get("price")) || 0,
      currency: (form.get("currency") as string) || "USD",
      redirectPath: (form.get("redirectPath") as string) || "/success",
      description: (form.get("description") as string) || "",
      active: true,
    });
    setSubmitting(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Product" width={500}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label>Product Name</Label>
          <input name="name" placeholder="e.g. Pro Plan" required style={inputStyle} />
        </div>
        <div>
          <Label>Description</Label>
          <input name="description" placeholder="Annual subscription to Pro" style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Pricing Type</Label>
            <select name="type" style={selectStyle}>
              <option value="one-time">One-time</option>
              <option value="subscription">Subscription</option>
              <option value="usage-based">Usage-based</option>
            </select>
          </div>
          <div style={{ width: 140 }}>
            <Label>Price</Label>
            <input name="price" type="number" step="0.01" placeholder="29.00" required style={inputStyle} />
          </div>
          <div style={{ width: 90 }}>
            <Label>Currency</Label>
            <select name="currency" style={selectStyle}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Redirect After Purchase</Label>
          <input name="redirectPath" placeholder="/success" style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 600, color: "#888", marginBottom: 5 }}>{children}</div>;
}
