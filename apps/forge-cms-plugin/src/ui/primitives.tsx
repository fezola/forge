import React from "react";
import { tokens } from "./design";

const { color, radius, space, font, transition } = tokens;

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: value ? color.textTertiary : color.textPlaceholder,
          transition: `color ${transition.fast}`,
        }}
      >
        <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9.5 9.5l3.25 3.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        style={{
          width: "100%",
          padding: "8px 10px 8px 32px",
          border: `1px solid ${value ? color.borderFocus : color.borderLight}`,
          borderRadius: radius.md,
          fontSize: font.size.base,
          color: color.text,
          outline: "none",
          background: color.surface,
          boxSizing: "border-box",
          fontFamily: font.family,
          transition: `all ${transition.fast}`,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = color.borderFocus;
          e.target.style.background = color.bg;
        }}
        onBlur={(e) => {
          if (!value) {
            e.target.style.borderColor = color.borderLight;
            e.target.style.background = color.surface;
          }
        }}
      />
    </div>
  );
}

export function Pill({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "5px 12px",
        borderRadius: radius.full,
        fontSize: font.size.sm,
        fontWeight: active ? font.weight.semibold : font.weight.medium,
        cursor: disabled ? "default" : "pointer",
        background: active ? color.accent : color.surfaceHover,
        color: active ? color.accentText : color.textSecondary,
        border: active ? "none" : `1px solid ${color.borderLight}`,
        transition: `all ${transition.fast}`,
        whiteSpace: "nowrap",
        fontFamily: font.family,
        opacity: disabled ? 0.4 : 1,
        lineHeight: "18px",
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = color.border;
          e.currentTarget.style.color = color.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = color.surfaceHover;
          e.currentTarget.style.color = color.textSecondary;
        }
      }}
    >
      {label}
    </button>
  );
}

export function ComponentCard({
  icon,
  name,
  description,
  onClick,
  disabled,
}: {
  icon: string;
  name: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "10px 12px",
        border: `1px solid ${color.borderLight}`,
        borderRadius: radius.md,
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: space.md,
        background: color.bg,
        transition: `all ${transition.fast}`,
        textAlign: "left",
        fontFamily: font.family,
        opacity: disabled ? 0.6 : 1,
        outline: "none",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = color.border;
          e.currentTarget.style.background = color.surface;
          e.currentTarget.style.boxShadow = `0 1px 4px ${color.shadow}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = color.borderLight;
          e.currentTarget.style.background = color.bg;
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = color.borderFocus;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = color.borderLight;
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: radius.sm,
          background: color.surfaceHover,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: font.size.base,
            fontWeight: font.weight.semibold,
            color: color.text,
            lineHeight: "18px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: font.size.sm,
            color: color.textTertiary,
            marginTop: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: "16px",
          }}
        >
          {description}
        </div>
      </div>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: radius.sm,
          background: color.surfaceHover,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          color: color.textTertiary,
          flexShrink: 0,
          transition: `all ${transition.fast}`,
        }}
      >
        +
      </div>
    </button>
  );
}

export function SectionHeader({
  icon,
  label,
  count,
}: {
  icon?: string;
  label: string;
  count?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 0 5px",
      }}
    >
      {icon && <span style={{ fontSize: 13, lineHeight: "16px" }}>{icon}</span>}
      <span
        style={{
          fontSize: font.size.xs,
          fontWeight: font.weight.semibold,
          color: color.textTertiary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          lineHeight: "16px",
        }}
      >
        {label}
      </span>
      {count !== undefined && (
        <span
          style={{
            fontSize: font.size.xs,
            color: color.border,
            marginLeft: "auto",
            lineHeight: "16px",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ opacity: 0.25, marginBottom: 12 }}>{icon}</div>
      <div
        style={{
          fontSize: font.size.md,
          fontWeight: font.weight.medium,
          color: color.textTertiary,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: font.size.sm,
            color: color.textPlaceholder,
            marginTop: 2,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function Overlay({
  message,
}: {
  message?: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: color.overlay,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        zIndex: 100,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          border: "2px solid #e5e7eb",
          borderTopColor: color.accent,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          fontSize: font.size.base,
          fontWeight: font.weight.medium,
          color: color.textSecondary,
        }}
      >
        {message || "Loading..."}
      </div>
    </div>
  );
}
