import { useState, useMemo } from "react";
import { Package, Copy, Check } from "../ui/icons";

export function PaymentsPage() {
  const [name, setName] = useState("Pro Plan");
  const [price, setPrice] = useState("29.00");
  const [currency, setCurrency] = useState("usd");
  const [type, setType] = useState<"one-time" | "subscription">("one-time");
  const [provider, setProvider] = useState<"stripe" | "paypal" | "crypto">("stripe");
  const [stripePriceId, setStripePriceId] = useState("");
  const [stripePubKey, setStripePubKey] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);

  const embedCode = useMemo(() => {
    const amt = parseFloat(price) || 0;
    const cur = currency.toUpperCase();

    if (provider === "stripe" && stripePriceId && stripePubKey) {
      return `<script src="https://js.stripe.com/v3"></script>
<button id="forge-checkout-btn" style="background:#111;color:#fff;border:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:system-ui,sans-serif">
  Pay ${cur}${price}
</button>
<script>
  var stripe = Stripe("${stripePubKey}");
  document.getElementById("forge-checkout-btn").onclick = function() {
    stripe.redirectToCheckout({ lineItems: [{ price: "${stripePriceId}", quantity: 1 }], mode: "${type === "one-time" ? "payment" : "subscription"}" });
  };
</script>`;
    }

    if (provider === "paypal" && paypalEmail) {
      return `<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
  <input type="hidden" name="cmd" value="${type === "one-time" ? "_xclick" : "_xclick-subscriptions"}">
  <input type="hidden" name="business" value="${paypalEmail}">
  <input type="hidden" name="item_name" value="${name}">
  <input type="hidden" name="amount" value="${price}">
  <input type="hidden" name="currency_code" value="${cur}">
  <button type="submit" style="background:#ffc439;color:#111;border:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:system-ui,sans-serif">
    Pay with PayPal
  </button>
</form>`;
    }

    if (provider === "crypto" && walletAddress) {
      return `<div style="border:2px dashed #ddd;border-radius:12px;padding:24px;text-align:center;font-family:system-ui,sans-serif">
  <p style="font-size:14px;color:#555;margin:0 0 12px">Send <strong>${cur}${price}</strong> for <strong>${name}</strong></p>
  <p style="font-size:12px;color:#999;margin:0 0 8px">Wallet Address</p>
  <code style="display:block;background:#f5f5f5;padding:10px;border-radius:8px;font-size:12px;word-break:break-all">${walletAddress}</code>
  <p style="font-size:11px;color:#bbb;margin-top:12px">Send exact amount. Include email in memo.</p>
</div>`;
    }

    return `<!-- Fill in your payment provider settings above to generate the embed code -->`;
  }, [name, price, currency, type, provider, stripePriceId, stripePubKey, paypalEmail, walletAddress]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", border: "1.5px solid #eee", borderRadius: 8,
    fontSize: 13, color: "#111", outline: "none", background: "#f7f7f7",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 600, color: "#555", marginBottom: 4, display: "block",
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <Package size={14} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 650, letterSpacing: "-0.02em" }}>Forge Payments</div>
          <div style={{ fontSize: 11.5, color: "#bbb", marginTop: 1 }}>Generate payment embed code for your Framer site</div>
        </div>
      </div>

      {/* Product */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Product</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.00" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="one-time">One-time</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Provider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Payment Provider</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {(["stripe", "paypal", "crypto"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              style={{
                flex: 1, padding: "8px 0", border: provider === p ? "2px solid #111" : "1.5px solid #eee",
                borderRadius: 8, cursor: "pointer", background: provider === p ? "#f7f7f7" : "#fff",
                fontSize: 12, fontFamily: "inherit", fontWeight: 500,
                color: provider === p ? "#111" : "#888", textTransform: "capitalize",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {provider === "stripe" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={labelStyle}>Publishable Key <span style={{ color: "#bbb", fontWeight: 400 }}>(pk_...)</span></label>
              <input value={stripePubKey} onChange={(e) => setStripePubKey(e.target.value)} placeholder="pk_live_..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price ID <span style={{ color: "#bbb", fontWeight: 400 }}>(price_...)</span></label>
              <input value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} placeholder="price_..." style={inputStyle} />
              <div style={{ fontSize: 10.5, color: "#bbb", marginTop: 3 }}>Create a price in your Stripe Dashboard first</div>
            </div>
          </div>
        )}

        {provider === "paypal" && (
          <div>
            <label style={labelStyle}>PayPal Email</label>
            <input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="merchant@example.com" style={inputStyle} />
          </div>
        )}

        {provider === "crypto" && (
          <div>
            <label style={labelStyle}>Wallet Address</label>
            <input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x... or sol..." style={inputStyle} />
            <div style={{ fontSize: 10.5, color: "#bbb", marginTop: 3 }}>Buyer sends exact amount to this address</div>
          </div>
        )}
      </div>

      {/* Generated Code */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em" }}>Embed Code</div>
          <button
            onClick={handleCopy}
            style={{
              padding: "6px 14px", border: "none", borderRadius: 6, cursor: "pointer",
              background: copied ? "#dcfce7" : "#111",
              color: copied ? "#166534" : "#fff",
              fontSize: 11.5, fontFamily: "inherit", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <pre style={{
          background: "#f5f5f5", border: "1px solid #eee", borderRadius: 10,
          padding: 14, fontSize: 11.5, fontFamily: "'SF Mono', 'Fira Code', monospace",
          color: "#333", overflow: "auto", maxHeight: 300, margin: 0, lineHeight: "18px",
        }}>
          {embedCode}
        </pre>
      </div>

      <div style={{
        padding: 14, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10,
        fontSize: 12, color: "#9a3412", lineHeight: "18px",
      }}>
        <strong>How to use:</strong> In your Framer site, add an <strong>Embed</strong> component from the Insert panel, paste this code, and resize the embed to fit your design. The button will work when you publish your site.
      </div>
    </div>
  );
}
