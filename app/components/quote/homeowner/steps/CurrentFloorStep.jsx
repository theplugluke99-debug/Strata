"use client";
import { SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM } from "../../tokens";

const PRACTICAL_FLAGS = [
  { id: "pets_children",  label: "Pets or children in this room" },
  { id: "high_footfall",  label: "High footfall or heavy use" },
  { id: "ufh",            label: "Underfloor heating present" },
  { id: "rental",         label: "Rental or investment property" },
  { id: "bare_feet",      label: "Bare feet comfort is a priority" },
];

export default function CurrentFloorStep({ roomName, room, dispatch }) {
  const update = (updates) =>
    dispatch({ type: "HO_UPDATE_ROOM", payload: { roomName, updates } });

  return (
    <>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
        Anything we should know?
      </h2>
      <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 14, margin: "0 0 28px" }}>
        Select all that apply. Helps Flo give you the right spec.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PRACTICAL_FLAGS.map((flag) => {
          const active = (room.practicalFlags ?? []).includes(flag.id);
          return (
            <button
              key={flag.id}
              onClick={() => {
                const flags = room.practicalFlags ?? [];
                update({ practicalFlags: active ? flags.filter((f) => f !== flag.id) : [...flags, flag.id] });
              }}
              style={{
                background: active ? GOLD_DIM : SURFACE,
                border: `1px solid ${active ? GOLD : BORDER}`,
                borderRadius: 10,
                padding: "16px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "all 0.2s",
                textAlign: "left",
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                border: `1.5px solid ${active ? GOLD : BORDER}`,
                background: active ? GOLD : "transparent",
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#111110" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ color: active ? TEXT : MUTED, fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
                {flag.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
