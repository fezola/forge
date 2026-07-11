import { useState } from "react";
import { PaymentsState } from "../types/payments";
import { CreditCard, Users, Repeat, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Store, TicketPercent } from "../ui/icons";
import { CreateProductModal } from "./CreateProductModal";
import { CreateCouponModal } from "./CreateCouponModal";
import { CreatePaymentLinkModal } from "./CreatePaymentLinkModal";

interface Props {
  payments: {
    state: PaymentsState;
    addSampleData: () => void;
  };
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: "18px 20px",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 500,
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 6,
};

export function PaymentsDashboard({ payments }: Props) {
  const { state } = payments;
  const { transactions, totalRevenue, totalTransactions, mrr, conversionRate } = state;
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [showCreatePaymentLink, setShowCreatePaymentLink] = useState(false);

  const recentTxs = transactions.slice(0, 5);

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        Payments Dashboard
      </div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 24 }}>
        Overview of your payment activity
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <KPICard
          icon={<DollarSign size={14} />}
          label="Total Revenue"
          value={`$${(totalRevenue / 100).toFixed(2)}`}
          trend="+12.5%"
          trendUp
        />
        <KPICard
          icon={<CreditCard size={14} />}
          label="Transactions"
          value={String(totalTransactions)}
          trend="+8.3%"
          trendUp
        />
        <KPICard
          icon={<Repeat size={14} />}
          label="MRR"
          value={`$${(mrr / 100).toFixed(2)}`}
          trend="+5.1%"
          trendUp
        />
        <KPICard
          icon={<TrendingUp size={14} />}
          label="Conversion"
          value={`${conversionRate.toFixed(1)}%`}
          trend="-2.1%"
          trendUp={false}
        />
      </div>

      {/* Revenue Chart Area */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={labelStyle}>Revenue (Last 30 Days)</div>
        <div
          style={{
            height: 160,
            background: "linear-gradient(180deg, #f5f5f5 0%, #fafafa 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ccc",
            fontSize: 12,
          }}
        >
          📊 Chart placeholder — connect data source to render
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={labelStyle}>Recent Transactions</div>
          <span style={{ fontSize: 11, color: "#bbb" }}>Last 5</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {recentTxs.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: tx.status === "succeeded" ? "#dcfce7" : tx.status === "failed" ? "#fce7e7" : "#fef3c7",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                }}>
                  {tx.status === "succeeded" ? "✅" : tx.status === "failed" ? "❌" : "⏳"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.customerName}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>{tx.productName}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  ${(tx.amount / 100).toFixed(2)}
                </div>
                <div style={{ fontSize: 10, color: "#bbb", textTransform: "uppercase" }}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...cardStyle }}>
        <div style={labelStyle}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <QuickActionBtn label="Create Product" icon={<Store size={13} />} onClick={() => setShowCreateProduct(true)} />
          <QuickActionBtn label="Create Coupon" icon={<TicketPercent size={13} />} onClick={() => setShowCreateCoupon(true)} />
          <QuickActionBtn label="Payment Link" icon={<CreditCard size={13} />} onClick={() => setShowCreatePaymentLink(true)} />
        </div>
      </div>

      <CreateProductModal open={showCreateProduct} onClose={() => setShowCreateProduct(false)} />
      <CreateCouponModal open={showCreateCoupon} onClose={() => setShowCreateCoupon(false)} />
      <CreatePaymentLinkModal open={showCreatePaymentLink} onClose={() => setShowCreatePaymentLink(false)} />
    </div>
  );
}

function KPICard({ icon, label, value, trend, trendUp }: {
  icon: React.ReactNode; label: string; value: string; trend: string; trendUp: boolean;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "#999" }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: trendUp ? "#16a34a" : "#dc2626" }}>
        {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {trend}
      </div>
    </div>
  );
}

function QuickActionBtn({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 10px",
        border: "1px solid #eee",
        borderRadius: 10,
        cursor: "pointer",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        fontFamily: "inherit",
        fontSize: 11.5,
        fontWeight: 500,
        color: "#555",
        transition: "all 0.12s ease",
      }}
    >
      <span style={{ color: "#999" }}>{icon}</span>
      {label}
    </button>
  );
}
