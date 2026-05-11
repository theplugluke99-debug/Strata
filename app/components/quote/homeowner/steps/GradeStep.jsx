"use client";
import { SURFACE, BORDER, TEXT, MUTED, GOLD } from "../../tokens";

const MOODS = [
  {
    id: "calm",
    label: "Calm & Minimal",
    desc: "Clean lines, neutral tones, understated luxury",
    gradient: "linear-gradient(135deg, #2a2a28 0%, #3a3830 50%, #4a4840 100%)",
  },
  {
    id: "warm",
    label: "Warm & Characterful",
    desc: "Texture, warmth, materials with personality",
    gradient: "linear-gradient(135deg, #3a2a18 0%, #4a3820 50%, #6a4828 100%)",
  },
  {
    id: "bold",
    label: "Bold & Considered",
    desc: "Strong contrasts, confident choices, standout spaces",
    gradient: "linear-gradient(135deg, #1a1a2a 0%, #2a2040 50%, #3a2850 100%)",
  },
];

export default function GradeStep({ roomName, room, dispatch }) {
  const update = (updates) =>
    dispatch({ type: "HO_UPDATE_ROOM", payload: { roomName, updates } });

  return (
    <>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
        What's the feel you're after?
      </h2>
      <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 14, margin: "0 0 28px" }}>
        This shapes Flo's recommendation for this room.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOODS.map((mood) => {
          const active = room.mood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => update({ mood: mood.id })}
              style={{
                background: active ? mood.gradient : SURFACE,
                border: `1px solid ${active ? GOLD : BORDER}`,
                borderRadius: 14,
                padding: "24px 28px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.25s",
              }}
            >
              <div style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                {mood.label}
              </div>
              <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
                {mood.desc}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
