import { useState, useMemo, useRef, useEffect } from "react";
import { generateInteractiveComponent, COMPONENT_REGISTRY } from "../lib/codegen";
import { insertDetachedComponent } from "../lib/moduleHost";
import {
  Search, Plus, Grid, Lock, Database, Hexagon, Brain,
  Package, Rocket, Building, Store, Plug, Palette,
  Spinner, ChevronRight,
} from "../ui/icons";

interface ComponentDef {
  id: string;
  name: string;
  description: string;
  category: string;
}

const COMPONENTS: ComponentDef[] = [
  { id: "forge-auth-sign-in", name: "Sign In", description: "Email + password sign in form", category: "auth" },
  { id: "forge-auth-sign-up", name: "Sign Up", description: "Registration form with name, email, password", category: "auth" },
  { id: "forge-auth-forgot-password", name: "Forgot Password", description: "Send password reset link", category: "auth" },
  { id: "forge-auth-reset-password", name: "Reset Password", description: "Set new password form", category: "auth" },
  { id: "forge-auth-accept-invite", name: "Accept Invite", description: "Accept team/organization invite", category: "auth" },
  { id: "forge-auth-verify-email", name: "Verify Email", description: "Email verification prompt", category: "auth" },
  { id: "forge-auth-magic-link", name: "Magic Link", description: "Passwordless email magic link form", category: "auth" },
  { id: "forge-auth-update-password", name: "Update Password", description: "Change current password form", category: "auth" },
  { id: "forge-user-profile", name: "User Profile", description: "Current user info display", category: "auth" },
  { id: "forge-user-avatar", name: "User Avatar", description: "Current user avatar image", category: "auth" },
  { id: "forge-data-table", name: "Data Table", description: "Structured tabular data display", category: "data" },
  { id: "forge-data-card", name: "Data Card", description: "Single record detail card", category: "data" },
  { id: "forge-data-list", name: "Data List", description: "Repeatable list of records", category: "data" },
  { id: "forge-data-chart", name: "Data Chart", description: "Bar, line and pie charts", category: "data" },
  { id: "forge-wallet-connect", name: "Wallet Connect", description: "Connect crypto wallet", category: "blockchain" },
  { id: "forge-wallet-balance", name: "Wallet Balance", description: "Token balance display", category: "blockchain" },
  { id: "forge-nft-card", name: "NFT Card", description: "NFT collection display", category: "blockchain" },
  { id: "forge-ai-generate", name: "AI Generate", description: "AI-powered text generation", category: "ai" },
  { id: "forge-ai-chat", name: "AI Chat", description: "Interactive chat interface", category: "ai" },
  { id: "forge-file-upload", name: "File Upload", description: "Upload files to storage", category: "storage" },
  { id: "forge-file-preview", name: "File Preview", description: "Preview uploaded files", category: "storage" },
  { id: "forge-deployment-status", name: "Deployment Status", description: "Deployment state badge", category: "deployment" },
  { id: "forge-deployment-metrics", name: "Deployment Metrics", description: "Deployment stats overview", category: "deployment" },
  { id: "forge-enterprise-sso-button", name: "SSO Button", description: "Single sign-on provider button", category: "enterprise" },
  { id: "forge-enterprise-compliance-badge", name: "Compliance Badge", description: "Compliance certification indicator", category: "enterprise" },
  { id: "forge-enterprise-role-badge", name: "Role Badge", description: "RBAC role indicator", category: "enterprise" },
  { id: "forge-marketplace-listing-card", name: "Listing Card", description: "Marketplace listing preview", category: "marketplace" },
  { id: "forge-marketplace-install-button", name: "Install Button", description: "Install from marketplace", category: "marketplace" },
  { id: "forge-connector-status", name: "Connector Status", description: "API connector health indicator", category: "connector" },
  { id: "forge-connector-data-card", name: "Connector Data", description: "External data point display", category: "connector" },
  { id: "forge-button", name: "Button", description: "Configurable action button", category: "ui" },
  { id: "forge-text", name: "Text", description: "Data-bound text element", category: "ui" },
  { id: "forge-input", name: "Input", description: "Form input field", category: "ui" },
  { id: "forge-badge", name: "Badge", description: "Status badge indicator", category: "ui" },
  { id: "forge-avatar", name: "Avatar", description: "User avatar component", category: "ui" },
  { id: "forge-card", name: "Card", description: "Content container wrapper", category: "ui" },
  { id: "forge-payment-button", name: "Payment Button", description: "Trigger a payment flow", category: "ui" },
  { id: "forge-payment-status", name: "Payment Status", description: "Transaction status badge", category: "ui" },
  { id: "forge-pricing-table", name: "Pricing Table", description: "Plan comparison display", category: "ui" },
];

const CATEGORIES: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "auth", label: "Auth", icon: <Lock size={14} /> },
  { key: "data", label: "Data", icon: <Database size={14} /> },
  { key: "blockchain", label: "Blockchain", icon: <Hexagon size={14} /> },
  { key: "ai", label: "AI", icon: <Brain size={14} /> },
  { key: "storage", label: "Storage", icon: <Package size={14} /> },
  { key: "deployment", label: "Deployment", icon: <Rocket size={14} /> },
  { key: "enterprise", label: "Enterprise", icon: <Building size={14} /> },
  { key: "marketplace", label: "Marketplace", icon: <Store size={14} /> },
  { key: "connector", label: "Connector", icon: <Plug size={14} /> },
  { key: "ui", label: "UI", icon: <Palette size={14} /> },
];

const DEFAULT_EXPANDED = "auth";

export function ComponentBrowser() {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set([DEFAULT_EXPANDED]));
  const [insertingId, setInsertingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return COMPONENTS.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, ComponentDef[]>>((acc, c) => {
      (acc[c.category] ??= []).push(c);
      return acc;
    }, {});
  }, [filtered]);

  const toggle = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  async function handleInsert(componentId: string, componentName: string) {
    setInsertingId(componentId);
    setError(null);
    try {
      const entry = COMPONENT_REGISTRY.find((c) => c.id === componentId);
      if (!entry) throw new Error(`Component ${componentId} not found in registry`);
      const code = generateInteractiveComponent(componentId, entry.schema);
      await insertDetachedComponent(componentId, componentName, code);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setInsertingId(null);
    }
  }

  const shownCategories = search ? CATEGORIES.filter((c) => grouped[c.key]?.length) : CATEGORIES;

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: "100%", display: "flex", flexDirection: "column",
      background: "#ffffff", color: "#111", fontSize: 13,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Grid size={14} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em" }}>Forge</span>
        </div>
        <span style={{ fontSize: 11.5, color: "#bbb", fontWeight: 450 }}>{COMPONENTS.length} components</span>
      </div>

      {/* Search */}
      <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#ccc", display: "flex", pointerEvents: "none" }}>
            <Search size={13} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            style={{
              width: "100%", padding: "8px 10px 8px 32px", border: "1.5px solid #eee",
              borderRadius: 10, fontSize: 13, color: "#111", outline: "none",
              background: "#f7f7f7", boxSizing: "border-box", fontFamily: "inherit",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#111"; e.target.style.background = "#fff"; }}
            onBlur={(e) => { e.target.style.borderColor = "#eee"; if (!search) e.target.style.background = "#f7f7f7"; }}
          />
        </div>
      </div>

      <div style={{ margin: "14px 20px 0", height: 1, background: "#f0f0f0", flexShrink: 0 }} />

      {/* Accordion list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 20px" }}>
        {shownCategories.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px" }}>
            <div style={{ opacity: 0.12, marginBottom: 16 }}><Grid size={32} /></div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#bbb" }}>Nothing found</div>
            <div style={{ fontSize: 12, color: "#ddd", marginTop: 4 }}>Try a different search term</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {shownCategories.map((cat) => {
              const comps = grouped[cat.key] ?? [];
              const isExpanded = expandedCategories.has(cat.key);
              return (
                <CategorySection
                  key={cat.key}
                  label={cat.label}
                  icon={cat.icon}
                  count={comps.length}
                  isExpanded={isExpanded}
                  onToggle={() => toggle(cat.key)}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10 }}>
                    {comps.map((comp) => (
                      <AssetCard
                        key={comp.id}
                        name={comp.name}
                        description={comp.description}
                        icon={cat.icon}
                        onInsert={() => handleInsert(comp.id, comp.name)}
                        disabled={insertingId === comp.id}
                      />
                    ))}
                  </div>
                </CategorySection>
              );
            })}
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div style={{
          padding: "10px 16px", margin: "0 20px 16px", flexShrink: 0,
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
          fontSize: 12, color: "#b91c1c", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#b91c1c", padding: "2px 4px", fontFamily: "inherit" }}>✕</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CategorySection({ label, icon, count, isExpanded, onToggle, children }: {
  label: string; icon: React.ReactNode; count: number;
  isExpanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
  }, [children]);

  return (
    <div>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", height: 48, padding: "0 8px 0 10px", border: "none",
          borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          background: hovered ? "#f5f5f5" : "transparent",
          fontFamily: "inherit", textAlign: "left", boxSizing: "border-box",
        }}
      >
        <div style={{
          width: 20, height: 20, display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0, color: "#bbb",
          transition: "transform 0.2s ease",
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
        }}>
          <ChevronRight size={12} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", flexShrink: 0 }}>{icon}</div>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 590, color: "#333", letterSpacing: "-0.01em" }}>{label}</span>
        <div style={{ padding: "1px 7px", borderRadius: 5, fontSize: 11, fontWeight: 500, color: "#bbb", background: "#f0f0f0", lineHeight: "18px" }}>{count}</div>
      </button>
      <div style={{ overflow: "hidden", transition: "height 0.22s ease, opacity 0.18s ease", height: isExpanded ? contentHeight : 0, opacity: isExpanded ? 1 : 0 }}>
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}

function AssetCard({ name, description, icon, onInsert, disabled }: {
  name: string; description: string; icon: React.ReactNode; onInsert: () => void; disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onInsert}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", minHeight: 80, padding: "14px 16px",
        border: `1px solid ${hovered && !disabled ? "#d4d4d4" : "#eeeeee"}`,
        borderRadius: 14, cursor: disabled ? "default" : "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", gap: 8, background: hovered && !disabled ? "#fafafa" : "#ffffff",
        textAlign: "left", fontFamily: "inherit",
        opacity: disabled ? 0.45 : 1,
        boxShadow: hovered && !disabled ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: hovered && !disabled ? "#eaeaea" : "#f5f5f5",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hovered && !disabled ? "#555" : "#aaa", flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111", letterSpacing: "-0.01em", flex: 1 }}>
          {name}
        </span>
        <div style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 500,
          color: hovered && !disabled ? "#fff" : "#ccc",
          background: hovered && !disabled ? "#111" : "transparent",
          display: "flex", alignItems: "center", gap: 4,
          lineHeight: "16px",
        }}>
          <Plus size={11} />
          Add
        </div>
      </div>
      <div style={{ fontSize: 12, color: hovered && !disabled ? "#999" : "#ccc", lineHeight: "16px", paddingLeft: 40 }}>
        {description}
      </div>
    </button>
  );
}
