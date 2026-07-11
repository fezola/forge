import { useEffect, useState } from "react";
import { X } from "../ui/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open && !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: visible ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0)",
          transition: "background 0.2s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          width,
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 64px)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
          opacity: visible ? 1 : 0,
          transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: "#111",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          fontSize: 13,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.02em" }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, border: "none", borderRadius: 6,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", background: "transparent", color: "#999",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
