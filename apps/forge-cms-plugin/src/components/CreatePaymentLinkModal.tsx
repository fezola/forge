import { useState } from "react";
import { Modal } from "./Modal";
import { usePayments } from "../hooks/usePayments";
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

export function CreatePaymentLinkModal({ open, onClose }: Props) {
  const { addPaymentLink } = usePayments();
  const { config } = useForgeConfig();
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const productName = form.get("productName") as string || "Product";
    const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
    const siteUrl = config.siteUrl || "forge.pay";

    addPaymentLink({
      id: `pl_${Date.now()}`,
      name: form.get("linkName") as string || "Checkout",
      url: `${siteUrl}/${slug}`,
      productId: selectedProduct || `prod_${Date.now()}`,
      productName,
      allowQuantity: form.get("allowQuantity") === "on",
      checkoutStyle: (form.get("checkoutStyle") as "minimal" | "branded" | "full-page") || "minimal",
      views: 0,
      checkouts: 0,
      revenue: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    setSubmitting(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Payment Link" width={500}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label>Link Name</Label>
          <input name="linkName" placeholder="Pro Plan Checkout" required style={inputStyle} />
        </div>

        <div>
          <Label>Product</Label>
          <select
            name="productName"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select a product...</option>
            {config.products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} — ${p.price.toFixed(2)}/{p.type === "one-time" ? "once" : p.type === "subscription" ? "mo" : "usage"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", color: "#555" }}>
            <input name="allowQuantity" type="checkbox" style={{ accentColor: "#111" }} />
            Allow quantity selection
          </label>
        </div>

        <div>
          <Label>Checkout Style</Label>
          <select name="checkoutStyle" style={selectStyle}>
            <option value="minimal">Minimal</option>
            <option value="branded">Branded</option>
            <option value="full-page">Full Page</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 18px", border: "1.5px solid #eee", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#fff", color: "#555", fontFamily: "inherit" }}>Cancel</button>
          <button type="submit" disabled={submitting} style={{ padding: "8px 18px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#111", color: "#fff", fontFamily: "inherit", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Creating..." : "Create Link"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 600, color: "#888", marginBottom: 5 }}>{children}</div>;
}
