import React from "react";

const s = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const Search = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

export const Plus = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><path d="M12 5v14M5 12h14" /></svg>
);

export const Grid = ({ size = 24, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg {...s(size)} style={style}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
);

export const Lock = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);

export const Database = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
);

export const CreditCard = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>
);

export const Hexagon = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
);

export const Brain = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" /></svg>
);

export const Package = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>
);

export const Rocket = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><path d="M4.5 16.5c-1.5 1.26-1.5 4.5-1.5 4.5s3.24 0 4.5-1.5" /><path d="M14 4c-3.5 2-6 6-6 10v2h2c4 0 8-2.5 10-6" /><path d="M16 13a3 3 0 1 0-6-6 3 3 0 0 0 6 6Z" /></svg>
);

export const Building = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01" /></svg>
);

export const Store = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-1.5 1.93 2.75 2.75 0 0 1-3.5-1.86 2.75 2.75 0 0 1-5 0 2.75 2.75 0 0 1-5 0A2.75 2.75 0 0 1 3.5 10.93 2 2 0 0 1 2 10V7" /></svg>
);

export const Plug = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8v5a6 6 0 0 1-6 6" /><path d="M6 13V8h12" /><path d="M6 13a6 6 0 0 0 6 6" /></svg>
);

export const Palette = ({ size = 16 }: { size?: number }) => (
  <svg {...s(size)}><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.6 1.5-1.5 0-.4-.15-.7-.4-.9-.25-.2-.35-.5-.35-.85 0-.75.6-1.25 1.25-1.25H14c4.42 0 8-3.58 8-8 0-4.97-4.48-9-10-9Z" /></svg>
);

export const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg {...s(size)} style={{ animation: "spin 0.6s linear infinite" }}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.15" fill="none" />
    <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export const ChevronRight = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="m9 18 6-6-6-6" /></svg>
);

export const Folder = ({ size = 32 }: { size?: number }) => (
  <svg {...s(size)}><path d="M4 20V4a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" /></svg>
);

export const Globe = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);

export const Settings = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);

export const X = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

export const ArrowUpRight = ({ size = 12 }: { size?: number }) => (
  <svg {...s(size)}><path d="M7 7h10v10" /><path d="M17 7 7 17" /></svg>
);

export const ArrowDownRight = ({ size = 12 }: { size?: number }) => (
  <svg {...s(size)}><path d="m7 7 10 10" /><path d="M17 7v10H7" /></svg>
);

export const DollarSign = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);

export const TrendingUp = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
);

export const Users = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export const Repeat = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
);

export const FileText = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);

export const TicketPercent = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M9 9h.01" /><path d="m15 9-6 6" /><path d="M15 15h.01" /></svg>
);

export const Link = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);

export const Wallet = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
);

export const Activity = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);

export const RotateCcw = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
);

export const BarChart3 = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><path d="M3 3v18h18" /><path d="M7 16v-3" /><path d="M12 16v-7" /><path d="M17 16V8" /></svg>
);

export const Mail = ({ size = 12 }: { size?: number }) => (
  <svg {...s(size)}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);

export const Phone = ({ size = 12 }: { size?: number }) => (
  <svg {...s(size)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);

export const CheckCircle = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg {...s(size)} style={style}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);

export const Clock = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg {...s(size)} style={style}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

export const AlertCircle = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg {...s(size)} style={style}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

export const Check = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><polyline points="20 6 9 17 4 12" /></svg>
);

export const Copy = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);

export const Code = ({ size = 14 }: { size?: number }) => (
  <svg {...s(size)}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);
