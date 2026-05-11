"use client";
import { useState, useEffect } from "react";
import { SURFACE, SURFACE2, BORDER, MUTED, GOLD } from "../tokens";

const CAPTIONS = [
  "Your room outline",
  "Room outline measured",
  "Length and width marked",
  "Area calculated — done",
];

const TIPS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round">
        <line x1="1" y1="9" x2="17" y2="9"/>
        <line x1="1" y1="6" x2="1" y2="12"/>
        <line x1="17" y1="6" x2="17" y2="12"/>
      </svg>
    ),
    text: "Measure wall to wall, not skirting to skirting.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16V2H10V8H16V16H2Z"/>
      </svg>
    ),
    text: "L-shaped rooms: split into rectangles and add areas.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="14" height="10" rx="1"/>
        <path d="M6 6V3A3 3 0 0 1 12 3V6"/>
      </svg>
    ),
    text: "Include bay windows and alcoves at their widest.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="12" height="16" rx="1"/>
        <path d="M3 14H15"/>
        <circle cx="12" cy="9" r="0.8" fill={GOLD} stroke="none"/>
      </svg>
    ),
    text: "Measure to the far side of doorways — carpet tucks under.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round">
        <circle cx="6" cy="6" r="3"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="14" y1="4" x2="4" y2="14"/>
      </svg>
    ),
    text: "We add 10% wastage automatically — just enter the floor area.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="7"/>
        <path d="M9 10V9C10.1 9 11 8.1 11 7A2 2 0 0 0 7 7"/>
        <circle cx="9" cy="12.5" r="0.8" fill={GOLD} stroke="none"/>
      </svg>
    ),
    text: "Not sure? Skip to survey — our team will measure on the day.",
  },
];

function RoomDemo({ phase }) {
  const rx = 20, ry = 10, rw = 118, rh = 82;
  const perim = 2 * (rw + rh);
  const cx = rx + rw / 2, cy = ry + rh / 2;
  return (
    <svg viewBox="0 0 200 128" style={{ width: "100%", maxWidth: 260, display: "block", margin: "0 auto" }}>
      <rect x={rx} y={ry} width={rw} height={rh}
        fill={GOLD + "22"}
        style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}
      />
      <rect x={rx} y={ry} width={rw} height={rh}
        fill="none" stroke={GOLD} strokeWidth="2"
        strokeDasharray={perim}
        strokeDashoffset={phase >= 1 ? 0 : perim}
        style={{ transition: "stroke-dashoffset 0.9s ease" }}
      />
      <g style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.4s ease 0.25s" }}>
        <line x1={rx} y1={ry + rh + 11} x2={rx + rw} y2={ry + rh + 11} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx} y1={ry + rh + 7} x2={rx} y2={ry + rh + 15} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx + rw} y1={ry + rh + 7} x2={rx + rw} y2={ry + rh + 15} stroke={GOLD} strokeWidth="1.5"/>
        <text x={cx} y={ry + rh + 25} textAnchor="middle" fill={GOLD} fontSize="9" fontFamily="system-ui,sans-serif">4.5 m</text>
      </g>
      <g style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.4s ease 0.45s" }}>
        <line x1={rx + rw + 11} y1={ry} x2={rx + rw + 11} y2={ry + rh} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx + rw + 7} y1={ry} x2={rx + rw + 15} y2={ry} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx + rw + 7} y1={ry + rh} x2={rx + rw + 15} y2={ry + rh} stroke={GOLD} strokeWidth="1.5"/>
        <text x={rx + rw + 18} y={cy + 4} textAnchor="start" fill={GOLD} fontSize="9" fontFamily="system-ui,sans-serif">3.2 m</text>
      </g>
      <g style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}>
        <circle cx={cx} cy={cy} r="17" fill="#1a1a18" stroke={GOLD} strokeWidth="1.5"/>
        <path d={`M${cx - 7} ${cy}L${cx - 2} ${cy + 5}L${cx + 8} ${cy - 6}`}
          stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
    </svg>
  );
}

export default function MeasureGuide() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!open) { setPhase(0); return; }
    setPhase(1);
    const t = setInterval(() => setPhase((p) => (p >= 3 ? 1 : p + 1)), 1900);
    return () => clearInterval(t);
  }, [open]);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "transparent",
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "11px 16px",
          color: MUTED,
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          transition: "border-color 0.2s",
        }}
      >
        <span>How to measure your room</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
          <path d="M2 5L7 9L12 5"/>
        </svg>
      </button>

      <div style={{ maxHeight: open ? 800 : 0, overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ paddingTop: 20 }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px 20px 20px", marginBottom: 16, textAlign: "center" }}>
            <RoomDemo phase={phase} />
            <p style={{ color: GOLD, fontFamily: "system-ui, sans-serif", fontSize: 12, margin: "14px 0 0", letterSpacing: "0.06em" }}>
              {CAPTIONS[phase]}
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Measuring tips
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TIPS.map((tip, i) => (
                <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {tip.icon}
                  <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, marginBottom: 10 }}>
              Measure with your phone
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Measure app", sub: "iPhone / iPad" },
                { label: "Google Measure", sub: "Android" },
              ].map((badge) => (
                <div key={badge.label} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px" }}>
                  <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, fontWeight: 500 }}>{badge.label}</div>
                  <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 10, marginTop: 2 }}>{badge.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
