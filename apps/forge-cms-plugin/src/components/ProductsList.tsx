import { useState } from "react";
import { useForgeConfig } from "../hooks/useForgeConfig";
import { ForgeProduct } from "../types/forge-config";
import { Plus, Store } from "../ui/icons";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "1.5px solid #eee",
  borderRadius: 8,
  fontSize: 13,
  color: "#111",
  outline: "none",
  background: "#fff",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  padding: "6px 14px",
  border: "none",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  background: "#111",
  color: "#fff",
  fontFamily: "inherit",
};

const btnSecondary: React.CSSProperties = {
  padding: "6px 14px",
  border: "1.5px solid #eee",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  background: "#fff",
  color: "#555",
  fontFamily: "inherit",
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  "one-time": { bg: "#e0e7ff", color: "#4338ca" },
  subscription: { bg: "#dbeafe", color: "#1d4ed8" },
  "usage-based": { bg: "#fce7f3", color: "#be185d" },
};

export function ProductsList() {
  const { config, addProduct, updateProduct, removeProduct } = useForgeConfig();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  }

  function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!editingId) return;
    updateProduct(editingId, {
      name: (form.get("name") as string) || undefined,
      type: (form.get("type") as ForgeProduct["type"]) || undefined,
      price: Number(form.get("price")) || undefined,
      currency: (form.get("currency") as string) || undefined,
      description: (form.get("description") as string) || undefined,
    });
    setEditingId(null);
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Products
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 5 }}
        >
          <Plus size={12} /> New Product
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>
        {config.products.length} products configured
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            background: "#fafafa",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <input name="name" placeholder="Product name" required style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <select name="type" style={{ ...inputStyle, width: "auto", flex: 1, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}>
              <option value="one-time">One-time</option>
              <option value="subscription">Subscription</option>
              <option value="usage-based">Usage-based</option>
            </select>
            <input name="price" type="number" step="0.01" placeholder="Price" required style={{ ...inputStyle, width: 120 }} />
            <select name="currency" style={{ ...inputStyle, width: 80, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <input name="description" placeholder="Description (optional)" style={inputStyle} />
          <input name="redirectPath" placeholder="Redirect path (e.g. /success)" style={inputStyle} />
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
            <button type="submit" style={btnPrimary}>Create Product</button>
          </div>
        </form>
      )}

      {/* Product list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {config.products.map((p) => {
          const tc = TYPE_COLORS[p.type] ?? { bg: "#f3f4f6", color: "#6b7280" };
          const isEditing = editingId === p.id;

          if (isEditing) {
            return (
              <form
                key={p.id}
                onSubmit={handleEditSubmit}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 14,
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <input name="name" defaultValue={p.name} style={inputStyle} />
                <div style={{ display: "flex", gap: 8 }}>
                  <select name="type" defaultValue={p.type} style={{ ...inputStyle, flex: 1, appearance: "none", cursor: "pointer" }}>
                    <option value="one-time">One-time</option>
                    <option value="subscription">Subscription</option>
                    <option value="usage-based">Usage-based</option>
                  </select>
                  <input name="price" type="number" step="0.01" defaultValue={p.price} style={{ ...inputStyle, width: 120 }} />
                  <select name="currency" defaultValue={p.currency} style={{ ...inputStyle, width: 80, appearance: "none", cursor: "pointer" }}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <input name="description" defaultValue={p.description} style={inputStyle} />
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setEditingId(null)} style={btnSecondary}>Cancel</button>
                  <button type="submit" style={btnPrimary}>Save</button>
                </div>
              </form>
            );
          }

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: "12px 16px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "box-shadow 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: tc.bg, color: tc.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Store size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ padding: "1px 7px", borderRadius: 5, fontSize: 10.5, fontWeight: 500, background: tc.bg, color: tc.color, lineHeight: "18px" }}>
                    {p.type}
                  </span>
                  {!p.active && (
                    <span style={{ padding: "1px 7px", borderRadius: 5, fontSize: 10.5, fontWeight: 500, background: "#f3f4f6", color: "#9ca3af", lineHeight: "18px" }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "#999", marginTop: 2 }}>
                  {p.currency.toUpperCase()} ${p.price.toFixed(2)} &middot; {p.redirectPath}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setEditingId(p.id)} style={btnSecondary}>Edit</button>
                <button onClick={() => removeProduct(p.id)} style={{ ...btnSecondary, color: "#dc2626" }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {config.products.length === 0 && !showForm && (
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
          <div style={{ opacity: 0.3, marginBottom: 12 }}><Store size={24} /></div>
          No products yet. Create your first product to start selling.
        </div>
      )}
    </div>
  );
}
