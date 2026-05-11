"use client";
import { useState, useEffect } from "react";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER } from "../tokens";

const WASTAGE = 1.1;

function toMetres(val, unit) {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0) return null;
  return unit === "ft" ? n * 0.3048 : n;
}

// ── Animated room demo ─────────────────────────────────────────────────────
const CAPTIONS = [
  "Your room outline",
  "Room outline measured",
  "Length and width marked",
  "Area calculated — done",
];

function RoomDemo({ phase }) {
  const rx = 20, ry = 10, rw = 118, rh = 82;
  const perim = 2 * (rw + rh);
  const cx = rx + rw / 2, cy = ry + rh / 2;
  return (
    <svg viewBox="0 0 200 128" style={{ width: "100%", maxWidth: 260, display: "block", margin: "0 auto" }}>
      {/* Area fill */}
      <rect x={rx} y={ry} width={rw} height={rh}
        fill={GOLD_DIM}
        style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.5s ease" }}
      />
      {/* Room outline */}
      <rect x={rx} y={ry} width={rw} height={rh}
        fill="none" stroke={GOLD} strokeWidth="2"
        strokeDasharray={perim}
        strokeDashoffset={phase >= 1 ? 0 : perim}
        style={{ transition: "stroke-dashoffset 0.9s ease" }}
      />
      {/* Length dimension */}
      <g style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.4s ease 0.25s" }}>
        <line x1={rx} y1={ry + rh + 11} x2={rx + rw} y2={ry + rh + 11} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx} y1={ry + rh + 7} x2={rx} y2={ry + rh + 15} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx + rw} y1={ry + rh + 7} x2={rx + rw} y2={ry + rh + 15} stroke={GOLD} strokeWidth="1.5"/>
        <text x={cx} y={ry + rh + 25} textAnchor="middle" fill={GOLD} fontSize="9" fontFamily="system-ui,sans-serif">4.5 m</text>
      </g>
      {/* Width dimension */}
      <g style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.4s ease 0.45s" }}>
        <line x1={rx + rw + 11} y1={ry} x2={rx + rw + 11} y2={ry + rh} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx + rw + 7} y1={ry} x2={rx + rw + 15} y2={ry} stroke={GOLD} strokeWidth="1.5"/>
        <line x1={rx + rw + 7} y1={ry + rh} x2={rx + rw + 15} y2={ry + rh} stroke={GOLD} strokeWidth="1.5"/>
        <text x={rx + rw + 18} y={cy + 4} textAnchor="start" fill={GOLD} fontSize="9" fontFamily="system-ui,sans-serif">3.2 m</text>
      </g>
      {/* Checkmark */}
      <g style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}>
        <circle cx={cx} cy={cy} r="17" fill="#1a1a18" stroke={GOLD} strokeWidth="1.5"/>
        <path d={`M${cx - 7} ${cy}L${cx - 2} ${cy + 5}L${cx + 8} ${cy - 6}`}
          stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
    </svg>
  );
}

// ── Tips ───────────────────────────────────────────────────────────────────
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

// ── Main component ─────────────────────────────────────────────────────────
export default function MeasuringTool({ roomName, value, onChange }) {
  const [unit, setUnit]     = useState(value?.unit ?? "m");
  const [length, setLength] = useState(value?.length ?? "");
  const [width, setWidth]   = useState(value?.width  ?? "");
  const [skip, setSkip]     = useState(value?.skipToSurvey ?? false);
  const [eduOpen, setEduOpen] = useState(false);
  const [phase, setPhase]     = useState(0);

  useEffect(() => {
    if (skip) {
      onChange({ length: "", width: "", unit, area: null, skipToSurvey: true });
      return;
    }
    const l = toMetres(length, unit);
    const w = toMetres(width,  unit);
    const area = l && w ? parseFloat((l * w * WASTAGE).toFixed(2)) : null;
    onChange({ length, width, unit, area, skipToSurvey: false });
  }, [length, width, unit, skip]);

  useEffect(() => {
    if (!eduOpen) { setPhase(0); return; }
    setPhase(1);
    const t = setInterval(() => setPhase((p) => (p >= 3 ? 1 : p + 1)), 1900);
    return () => clearInterval(t);
  }, [eduOpen]);

  const l = toMetres(length, unit);
  const w = toMetres(width, unit);
  const areaM2     = l && w ? (l * w).toFixed(2) : null;
  const withWastage = areaM2 ? (parseFloat(areaM2) * WASTAGE).toFixed(2) : null;

  const inputStyle = {
    background: SURFACE2,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    fontFamily: "system-ui, sans-serif",
    fontSize: 18,
    fontWeight: 500,
    padding: "14px 16px",
    width: "100%",
    outline: "none",
    textAlign: "center",
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Unit toggle */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}`, width: "fit-content" }}>
        {["m", "ft"].map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            style={{
              background: unit === u ? GOLD : "transparent",
              color: unit === u ? "#111110" : MUTED,
              border: "none",
              padding: "8px 20px",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {!skip && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Length
              </label>
              <input
                type="number" min="0" step="0.1"
                placeholder={unit === "m" ? "e.g. 4.5" : "e.g. 15"}
                value={length}
                onChange={(e) => setLength(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 20, paddingTop: 24 }}>×</div>
            <div>
              <label style={{ display: "block", color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Width
              </label>
              <input
                type="number" min="0" step="0.1"
                placeholder={unit === "m" ? "e.g. 3.2" : "e.g. 10"}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {withWastage && (
            <div style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                    Area (inc. 10% wastage)
                  </div>
                  <div style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 22 }}>
                    {withWastage} m²
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, marginBottom: 2 }}>Floor area</div>
                  <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 14 }}>{areaM2} m²</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Skip to survey */}
      <button
        onClick={() => setSkip(!skip)}
        style={{
          background: skip ? GOLD_DIM : "transparent",
          border: `1px solid ${skip ? GOLD_BORDER : BORDER}`,
          borderRadius: 8,
          padding: "12px 16px",
          color: skip ? TEXT : MUTED,
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "all 0.2s",
          width: "100%",
          marginBottom: 16,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {skip ? (
            <path d="M3 8L6.5 11.5L13 4.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
          )}
        </svg>
        I'm not sure — let the surveyor measure
        {skip && <span style={{ marginLeft: "auto", color: GOLD, fontSize: 11 }}>Selected</span>}
      </button>

      {/* Education panel toggle */}
      <button
        onClick={() => setEduOpen((o) => !o)}
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
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transform: eduOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
          <path d="M2 5L7 9L12 5"/>
        </svg>
      </button>

      {/* Education panel */}
      <div style={{ maxHeight: eduOpen ? 800 : 0, overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ paddingTop: 20 }}>
          {/* Animated SVG demo */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px 20px 20px", marginBottom: 16, textAlign: "center" }}>
            <RoomDemo phase={phase} />
            <p style={{ color: GOLD, fontFamily: "system-ui, sans-serif", fontSize: 12, margin: "14px 0 0", letterSpacing: "0.06em" }}>
              {CAPTIONS[phase]}
            </p>
          </div>

          {/* Tips */}
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

          {/* App badges */}
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
                  <div style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontSize: 12, fontWeight: 500 }}>{badge.label}</div>
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
