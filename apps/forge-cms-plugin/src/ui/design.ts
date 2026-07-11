export const tokens = {
  color: {
    bg: "#ffffff",
    surface: "#fafafa",
    surfaceHover: "#f5f5f5",
    border: "#e5e7eb",
    borderLight: "#f0f0f0",
    borderFocus: "#111111",
    text: "#111111",
    textSecondary: "#6b7280",
    textTertiary: "#9ca3af",
    textPlaceholder: "#b0b0b0",
    accent: "#111111",
    accentHover: "#333333",
    accentText: "#ffffff",
    danger: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    overlay: "rgba(255,255,255,0.88)",
    shadow: "rgba(0,0,0,0.06)",
    shadowMd: "rgba(0,0,0,0.1)",
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    full: 9999,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  font: {
    family:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    size: {
      xs: 11,
      sm: 12,
      base: 13,
      md: 14,
      lg: 15,
      xl: 18,
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  transition: {
    fast: "0.12s ease",
    normal: "0.18s ease",
  },
} as const;

export type Tokens = typeof tokens;
