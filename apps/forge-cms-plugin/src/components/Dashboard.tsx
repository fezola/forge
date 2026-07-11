import { useState } from "react";
import { framer } from "framer-plugin";
import { useForgeConfig } from "../hooks/useForgeConfig";
import { ForgeProduct, DEFAULT_CONFIG } from "../types/forge-config";
import { Plus, CreditCard, Store, Settings, Globe, X } from "../ui/icons";

export function Dashboard() {
  const { config, updateConfig, addProduct, updateProduct, removeProduct } =
    useForgeConfig();
  const [showAddProduct, setShowAddProduct] = useState(false);

  async function handleStripeConnect() {
    const key = prompt("Enter your Stripe Publishable Key:");
    if (!key) return;
    const secret = prompt("Enter your Stripe Secret Key:");
    if (!secret) return;
    updateConfig({
      stripe: {
        connected: true,
        publishableKey: key,
        secretKey: secret,
        accountName: "Connected Account",
      },
    });
    await framer.notify("Stripe connected successfully", { variant: "success" });
  }

  function handleStripeDisconnect() {
    updateConfig({
      stripe: { ...DEFAULT_CONFIG.stripe },
    });
  }

  function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const product: ForgeProduct = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name: (form.get("name") as string) || "",
      type: (form.get("type") as ForgeProduct["type"]) || "one-time",
      price: Number(form.get("price")) || 0,
      currency: (form.get("currency") as string) || "USD",
      redirectPath: (form.get("redirectPath") as string) || "/success",
      description: (form.get("description") as string) || "",
      active: true,
    };
    addProduct(product);
    setShowAddProduct(false);
  }

  const containerStyle: React.CSSProperties = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    color: "#111",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    fontSize: 13,
  };

  const scrollStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px 20px",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#999",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    marginBottom: 10,
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 14,
    background: "#fafafa",
  };

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
    padding: "7px 14px",
    border: "none",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    background: "#111",
    color: "#fff",
    fontFamily: "inherit",
  };

  const btnSecondary: React.CSSProperties = {
    padding: "7px 14px",
    border: "1.5px solid #eee",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    background: "#fff",
    color: "#555",
    fontFamily: "inherit",
  };

  const badgeStyle: React.CSSProperties = {
    padding: "2px 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: "18px",
  };

  return (
    <div style={containerStyle}>
      <div style={scrollStyle}>
        {/* Project Name */}
        <div style={sectionStyle}>
          <input
            value={config.projectName}
            onChange={(e) => updateConfig({ projectName: e.target.value })}
            placeholder="Project name"
            style={{
              ...inputStyle,
              fontSize: 16,
              fontWeight: 600,
              border: "none",
              padding: "0 0 4px 0",
              background: "transparent",
              borderRadius: 0,
              borderBottom: "1.5px solid #eee",
            }}
          />
          {!config.onboardingComplete && (
            <p style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
              Set up your project to get started. Configure Stripe, add
              products, and customize auth settings.
            </p>
          )}
        </div>

        {/* Site URL */}
        <div style={sectionStyle}>
          <div style={sectionTitle}><Globe size={12} /> Site URL</div>
          <div style={cardStyle}>
            <input
              value={config.siteUrl}
              onChange={(e) => updateConfig({ siteUrl: e.target.value })}
              placeholder="https://yoursite.com"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
              Your website URL. Used for redirects and CORS configuration.
            </p>
          </div>
        </div>

        {/* Stripe Connect */}
        <div style={sectionStyle}>
          <div style={sectionTitle}><CreditCard size={12} /> Stripe</div>
          <div style={cardStyle}>
            {config.stripe.connected ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        ...badgeStyle,
                        background: "#dcfce7",
                        color: "#166534",
                      }}
                    >
                      Connected
                    </div>
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {config.stripe.accountName}
                    </span>
                  </div>
                  <button onClick={handleStripeDisconnect} style={btnSecondary}>
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 12, color: "#999", margin: 0 }}>
                  Connect Stripe to accept payments. You'll need your Stripe API
                  keys.
                </p>
                <button onClick={handleStripeConnect} style={btnPrimary}>
                  Connect Stripe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div style={sectionStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={sectionTitle}><Store size={12} /> Products</div>
            <button
              onClick={() => setShowAddProduct(true)}
              style={{
                ...btnSecondary,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
              }}
            >
              <Plus size={11} /> Add
            </button>
          </div>

          {showAddProduct && (
            <form
              onSubmit={handleAddProduct}
              style={{
                ...cardStyle,
                marginBottom: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <input
                name="name"
                placeholder="Product name"
                required
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  name="type"
                  style={{
                    ...inputStyle,
                    width: "auto",
                    flex: 1,
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="one-time">One-time</option>
                  <option value="subscription">Subscription</option>
                  <option value="usage-based">Usage-based</option>
                </select>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  required
                  style={{ ...inputStyle, width: 100 }}
                />
                <select
                  name="currency"
                  style={{
                    ...inputStyle,
                    width: 80,
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <input
                name="description"
                placeholder="Description (optional)"
                style={inputStyle}
              />
              <input
                name="redirectPath"
                placeholder="Redirect path after purchase (e.g. /success)"
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  style={btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" style={btnPrimary}>
                  Save Product
                </button>
              </div>
            </form>
          )}

          {config.products.length === 0 && !showAddProduct && (
            <div
              style={{
                ...cardStyle,
                textAlign: "center",
                color: "#bbb",
                fontSize: 12,
                padding: "24px 14px",
              }}
            >
              No products yet. Add your first product to start selling.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {config.products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onUpdate={(patch) => updateProduct(p.id, patch)}
                onRemove={() => removeProduct(p.id)}
              />
            ))}
          </div>
        </div>

        {/* Auth Settings */}
        <div style={sectionStyle}>
          <div style={sectionTitle}><Settings size={12} /> Auth Settings</div>
          <div
            style={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <label
                style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}
              >
                Redirect after sign in
              </label>
              <input
                value={config.auth.redirectAfterSignIn}
                onChange={(e) =>
                  updateConfig({
                    auth: { ...config.auth, redirectAfterSignIn: e.target.value },
                  })
                }
                placeholder="/dashboard"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}
              >
                Redirect after sign up
              </label>
              <input
                value={config.auth.redirectAfterSignUp}
                onChange={(e) =>
                  updateConfig({
                    auth: { ...config.auth, redirectAfterSignUp: e.target.value },
                  })
                }
                placeholder="/dashboard"
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={config.auth.allowMagicLink}
                  onChange={(e) =>
                    updateConfig({
                      auth: { ...config.auth, allowMagicLink: e.target.checked },
                    })
                  }
                  style={{ accentColor: "#111" }}
                />
                Magic Link
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={config.auth.allowOAuth}
                  onChange={(e) =>
                    updateConfig({
                      auth: { ...config.auth, allowOAuth: e.target.checked },
                    })
                  }
                  style={{ accentColor: "#111" }}
                />
                OAuth Providers
              </label>
            </div>
          </div>
        </div>

        {!config.onboardingComplete && (
          <button
            onClick={() => {
              updateConfig({ onboardingComplete: true });
            }}
            style={{
              ...btnPrimary,
              width: "100%",
              padding: "10px",
              marginBottom: 20,
            }}
          >
            Complete Setup
          </button>
        )}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onUpdate,
  onRemove,
}: {
  product: ForgeProduct;
  onUpdate: (patch: Partial<ForgeProduct>) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const typeColors: Record<string, { bg: string; color: string }> = {
    "one-time": { bg: "#e0e7ff", color: "#4338ca" },
    subscription: { bg: "#dbeafe", color: "#1d4ed8" },
    "usage-based": { bg: "#fce7f3", color: "#be185d" },
  };

  const tc = typeColors[product.type] ?? { bg: "#f3f4f6", color: "#6b7280" };

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          onUpdate({
            name: (form.get("name") as string) || product.name,
            type: (form.get("type") as ForgeProduct["type"]) || product.type,
            price: Number(form.get("price")) || product.price,
            currency:
              (form.get("currency") as string) || product.currency,
            redirectPath:
              (form.get("redirectPath") as string) || product.redirectPath,
            description:
              (form.get("description") as string) || product.description,
          });
          setEditing(false);
        }}
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 12,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <input
          name="name"
          defaultValue={product.name}
          style={{
            width: "100%",
            padding: "7px 10px",
            border: "1.5px solid #eee",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <select
            name="type"
            defaultValue={product.type}
            style={{
              flex: 1,
              padding: "7px 10px",
              border: "1.5px solid #eee",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "inherit",
              background: "#fff",
            }}
          >
            <option value="one-time">One-time</option>
            <option value="subscription">Subscription</option>
            <option value="usage-based">Usage-based</option>
          </select>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={product.price}
            style={{
              width: 100,
              padding: "7px 10px",
              border: "1.5px solid #eee",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "inherit",
            }}
          />
        </div>
        <input
          name="redirectPath"
          defaultValue={product.redirectPath}
          style={{
            width: "100%",
            padding: "7px 10px",
            border: "1.5px solid #eee",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              padding: "5px 12px",
              border: "1.5px solid #eee",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              background: "#fff",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "5px 12px",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              background: "#111",
              color: "#fff",
              fontFamily: "inherit",
            }}
          >
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: "10px 14px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 500,
              lineHeight: "18px",
              background: tc.bg,
              color: tc.color,
            }}
          >
            {product.type}
          </span>
          {!product.active && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 5,
                fontSize: 11,
                fontWeight: 500,
                lineHeight: "18px",
                background: "#f3f4f6",
                color: "#9ca3af",
              }}
            >
              Inactive
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#999" }}>
          {product.currency} {product.price} &middot; {product.redirectPath}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={() => setEditing(true)}
          style={{
            padding: "4px 8px",
            border: "1.5px solid #eee",
            borderRadius: 6,
            fontSize: 11,
            cursor: "pointer",
            background: "#fff",
            color: "#888",
            fontFamily: "inherit",
          }}
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          style={{
            padding: "4px 8px",
            border: "1.5px solid #eee",
            borderRadius: 6,
            fontSize: 11,
            cursor: "pointer",
            background: "#fff",
            color: "#dc2626",
            fontFamily: "inherit",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
