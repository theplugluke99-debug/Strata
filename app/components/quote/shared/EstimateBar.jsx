"use client";
import { BG, SURFACE, BORDER, TEXT, MUTED, GOLD } from "../tokens";

export default function EstimateBar({ estimate, label = null }) {
  const show = estimate || label;
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: SURFACE,
      borderTop: `1px solid ${BORDER}`,
      padding: "12px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 100,
      backdropFilter: "blur(12px)",
    }}>
      <div>
        {estimate ? (
          <>
            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: MUTED, marginBottom: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Estimated total
            </div>
            <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 18, color: TEXT }}>
              £{estimate.low.toLocaleString()}
              <span style={{ color: MUTED, fontWeight: 400, fontSize: 14 }}> – £{estimate.high.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: MUTED, fontStyle: "italic" }}>
            {label}
          </div>
        )}
      </div>
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: MUTED, maxWidth: 200, textAlign: "right", lineHeight: 1.5 }}>
        Confirmed at survey. No hidden costs.
      </div>
    </div>
  );
}
