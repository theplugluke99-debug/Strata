"use client";
import { SURFACE, BORDER, MUTED, GOLD } from "../tokens";

export default function GoldNote({ children }) {
  return (
    <div style={{
      borderLeft: `3px solid ${GOLD}`,
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderLeftWidth: 3,
      borderLeftColor: GOLD,
      borderRadius: "0 8px 8px 0",
      padding: "12px 16px",
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M7 1L8.5 5H13L9.25 7.75L10.75 12L7 9.25L3.25 12L4.75 7.75L1 5H5.5L7 1Z" stroke={GOLD} strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
      <span style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13, lineHeight: 1.6 }}>
        {children}
      </span>
    </div>
  );
}
