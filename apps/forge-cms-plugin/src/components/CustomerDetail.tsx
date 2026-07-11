import { PaymentCustomer } from "../types/payments";
import { Drawer } from "./Drawer";
import { Mail, Phone } from "../ui/icons";

interface Props {
  customer: PaymentCustomer | null;
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

export function CustomerDetail({ customer, onClose }: Props) {
  if (!customer) return null;

  return (
    <Drawer open={!!customer} onClose={onClose} title="Customer Detail">
      {/* Avatar + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg,#f0f0f0,#e0e0e0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: "#666", flexShrink: 0,
        }}>
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 650, letterSpacing: "-0.02em" }}>{customer.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, fontSize: 12, color: "#999" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Mail size={11} />{customer.email}</span>
            {customer.phone && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Phone size={11} />{customer.phone}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, ...sectionStyle }}>
        <div>
          <div style={labelStyle}>Total Spent</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "#166534" }}>
            ${(customer.totalSpent / 100).toFixed(2)}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Transactions</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>
            {customer.totalTransactions}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Customer Since</div>
          <div style={valueStyle}>{new Date(customer.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
        <div>
          <div style={labelStyle}>Last Updated</div>
          <div style={valueStyle}>{new Date(customer.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Quick Actions</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ActionBtn label="Create Invoice" />
          <ActionBtn label="Send Email" />
          <ActionBtn label="Edit Customer" />
        </div>
      </div>
    </Drawer>
  );
}

function ActionBtn({ label }: { label: string }) {
  return (
    <button
      style={{
        padding: "8px 14px", border: "1.5px solid #eee", borderRadius: 8,
        fontSize: 12, fontWeight: 500, cursor: "pointer", background: "#fff",
        color: "#555", fontFamily: "inherit",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4d4d4"; e.currentTarget.style.background = "#fafafa"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.background = "#fff"; }}
    >
      {label}
    </button>
  );
}
