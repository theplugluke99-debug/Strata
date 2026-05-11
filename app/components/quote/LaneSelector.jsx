"use client";
import { useState } from "react";
import { useQuoteForm } from "./QuoteFormProvider";
import { BG, SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER } from "./tokens";

const LANES = [
  {
    id: "homeowner",
    title: "Homeowner",
    subtitle: "I'm renovating my home",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 14L16 4L28 14V28H20V20H12V28H4V14Z" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: "landlord",
    title: "Landlord",
    subtitle: "I'm a landlord or letting agent",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="10" width="10" height="18" rx="1" stroke={GOLD} strokeWidth="1.5" fill="none"/>
        <rect x="18" y="4" width="10" height="24" rx="1" stroke={GOLD} strokeWidth="1.5" fill="none"/>
        <line x1="4" y1="28" x2="28" y2="28" stroke={GOLD} strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "commercial",
    title: "Commercial",
    subtitle: "I'm fitting out a business",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="8" width="26" height="20" rx="1" stroke={GOLD} strokeWidth="1.5" fill="none"/>
        <path d="M10 8V6C10 4.9 10.9 4 12 4H20C21.1 4 22 4.9 22 6V8" stroke={GOLD} strokeWidth="1.5" fill="none"/>
        <line x1="3" y1="16" x2="29" y2="16" stroke={GOLD} strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "publicSector",
    title: "Public Sector / Council",
    subtitle: "I represent a public sector organisation",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 3L3 10V12H29V10L16 3Z" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <rect x="5" y="14" width="4" height="14" rx="0.5" stroke={GOLD} strokeWidth="1.5" fill="none"/>
        <rect x="14" y="14" width="4" height="14" rx="0.5" stroke={GOLD} strokeWidth="1.5" fill="none"/>
        <rect x="23" y="14" width="4" height="14" rx="0.5" stroke={GOLD} strokeWidth="1.5" fill="none"/>
        <line x1="3" y1="28" x2="29" y2="28" stroke={GOLD} strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function LaneSelector() {
  const { setCustomerType } = useQuoteForm();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100dvh",
      background: BG,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      {/* Wordmark */}
      <div style={{ marginBottom: 12, color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase" }}>
        Strata
      </div>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 300,
        fontSize: "clamp(28px, 5vw, 48px)",
        color: TEXT,
        textAlign: "center",
        margin: "0 0 12px",
        lineHeight: 1.2,
      }}>
        Tell us about your project
      </h1>
      <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 15, textAlign: "center", margin: "0 0 48px", maxWidth: 420 }}>
        We'll tailor everything to your situation.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
        width: "100%",
        maxWidth: 680,
      }}
        className="lane-grid"
      >
        {LANES.map((lane) => (
          <button
            key={lane.id}
            onClick={() => setCustomerType(lane.id)}
            onMouseEnter={() => setHovered(lane.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === lane.id ? SURFACE2 : SURFACE,
              border: `1px solid ${hovered === lane.id ? GOLD_BORDER : BORDER}`,
              borderRadius: 16,
              padding: "32px 28px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              transform: hovered === lane.id ? "translateY(-2px)" : "none",
            }}
          >
            <div>{lane.icon}</div>
            <div>
              <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 17, color: TEXT, marginBottom: 6 }}>
                {lane.title}
              </div>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                {lane.subtitle}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: GOLD, fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
              Get started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M8 4L11 7L8 10" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      <p style={{ marginTop: 48, color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, textAlign: "center" }}>
        Already know exactly what you want?{" "}
        <span style={{ color: GOLD, cursor: "pointer" }}>Get in touch</span>
      </p>

      <style>{`
        @media (max-width: 520px) {
          .lane-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
