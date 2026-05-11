"use client";
import { useState, useEffect } from "react";
import { SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER } from "../tokens";
import MeasureGuide from "../homeowner/MeasureGuide";

const WASTAGE = 1.1;

function toMetres(val, unit) {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0) return null;
  return unit === "ft" ? n * 0.3048 : n;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MeasuringTool({ roomName, value, onChange }) {
  const [unit, setUnit]     = useState(value?.unit ?? "m");
  const [length, setLength] = useState(value?.length ?? "");
  const [width, setWidth]   = useState(value?.width  ?? "");
  const [skip, setSkip]     = useState(value?.skipToSurvey ?? false);

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

      <MeasureGuide />
    </div>
  );
}
