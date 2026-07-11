import { PaymentProvider, WalletConnection } from "../types/payments";
import { Plug, Wallet } from "../ui/icons";

interface Props { providers: PaymentProvider[]; wallets: WalletConnection[] }

const PROVIDER_LOGOS: Record<string, string> = {
  stripe: "⚡", paystack: "PS", flutterwave: "FW", bridge: "BR",
  circle: "○", coinbase: "CB", monnify: "MN", "solana-pay": "◎",
};

export function ProvidersList({ providers, wallets }: Props) {
  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>Payment Providers</div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {providers.map((p) => (
            <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {PROVIDER_LOGOS[p.type] ?? <Plug size={15} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{p.accountName}</div>
              </div>
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: p.connected ? "#dcfce7" : "#f3f4f6", color: p.connected ? "#166534" : "#6b7280", lineHeight: "18px" }}>
                {p.connected ? "Connected" : "Disconnected"}
              </span>
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, background: "#f3f4f6", color: "#6b7280", lineHeight: "18px", textTransform: "capitalize" }}>
                {p.environment}
              </span>
            </div>
          ))}
          {providers.length === 0 && (
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "30px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
              No providers connected
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>Crypto Wallets</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {wallets.map((w) => (
          <div key={w.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: "14px 16px", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef3c7", color: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Wallet size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{w.label || w.network}</div>
              <div style={{ fontSize: 11, color: "#999", fontFamily: "monospace" }}>{w.address.slice(0, 6)}...{w.address.slice(-4)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{w.balance.toFixed(2)} {w.network === "Solana" ? "SOL" : "ETH"}</div>
              <div style={{ fontSize: 11, color: "#999" }}>${w.balanceUsd.toFixed(2)}</div>
            </div>
          </div>
        ))}
        {wallets.length === 0 && (
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: "30px 20px", textAlign: "center", color: "#bbb", fontSize: 12 }}>
            No wallets connected
          </div>
        )}
      </div>
    </div>
  );
}
