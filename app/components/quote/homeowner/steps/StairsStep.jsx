"use client";
import { SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM } from "../../tokens";

const STAIRS_TYPES = [
  { id: "wall-to-wall", label: "Full stair carpet", desc: "Wall to wall coverage" },
  { id: "runner",       label: "Stair runner",      desc: "Central strip, wood visible either side" },
  { id: "landing-only", label: "Landing only",      desc: "Landing carpet, no stairs" },
];

const RUNNER_FAMILIES = [
  { family: "Plain & Textural", options: ["Herringbone Weave", "Flat Ribbed", "Boucle"] },
  { family: "Striped",          options: ["Classic Stripe", "Wide Stripe", "Multi Stripe"] },
  { family: "Patterned",        options: ["Geometric", "Floral", "Tartan"] },
];

export default function StairsStep({ roomName, room, dispatch }) {
  const update = (updates) =>
    dispatch({ type: "HO_UPDATE_ROOM", payload: { roomName, updates } });

  return (
    <>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 28px", lineHeight: 1.2 }}>
        How would you like the stairs done?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {STAIRS_TYPES.map((st) => {
          const active = room.stairsType === st.id;
          return (
            <button
              key={st.id}
              onClick={() => update({ stairsType: st.id, runnerStyle: null })}
              style={{
                background: active ? GOLD_DIM : SURFACE,
                border: `1px solid ${active ? GOLD : BORDER}`,
                borderRadius: 12,
                padding: "20px 24px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{st.label}</div>
              <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13 }}>{st.desc}</div>
            </button>
          );
        })}
      </div>

      {room.stairsType === "runner" && (
        <div>
          <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
            Runner style
          </div>
          {RUNNER_FAMILIES.map((family) => (
            <div key={family.family} style={{ marginBottom: 20 }}>
              <div style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                {family.family}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {family.options.map((opt) => {
                  const active = room.runnerStyle === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => update({ runnerStyle: opt })}
                      style={{
                        background: active ? GOLD_DIM : SURFACE,
                        border: `1px solid ${active ? GOLD : BORDER}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                        cursor: "pointer",
                        color: active ? TEXT : MUTED,
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
