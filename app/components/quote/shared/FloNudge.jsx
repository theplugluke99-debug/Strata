"use client";
import { GOLD_DIM, GOLD_BORDER, GOLD, TEXT } from "../tokens";

export default function FloNudge({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: 12, marginBottom: 20 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="4.5" r="2.3" stroke={GOLD} strokeWidth="1.1"/>
          <path d="M1 12C1 9.5 3.5 8 6.5 8C9.5 8 12 9.5 12 12" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
      </div>
      <p style={{ color: TEXT, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
        {message}
      </p>
    </div>
  );
}
