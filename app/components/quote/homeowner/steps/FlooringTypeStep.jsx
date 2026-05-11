"use client";
import { SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM } from "../../tokens";

const FLOORING_TYPES = [
  { id: "Carpet",   img: "/quote-carpet.png" },
  { id: "LVT",      img: "/quote-lvt.png" },
  { id: "Laminate", img: "/quote-laminate.png" },
  { id: "Vinyl",    img: "/quote-vinyl.webp" },
];

export default function FlooringTypeStep({ roomName, room, dispatch }) {
  const update = (updates) =>
    dispatch({ type: "HO_UPDATE_ROOM", payload: { roomName, updates } });

  return (
    <>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 28px", lineHeight: 1.2 }}>
        What type of flooring?
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {FLOORING_TYPES.map((ft) => {
          const active = room.flooringType === ft.id;
          return (
            <button
              key={ft.id}
              onClick={() => update({ flooringType: ft.id, design: null, colour: null })}
              style={{
                background: active ? GOLD_DIM : SURFACE,
                border: `1px solid ${active ? GOLD : BORDER}`,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s",
              }}
            >
              <div style={{ height: 100, overflow: "hidden" }}>
                <img src={ft.img} alt={ft.id} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "12px 14px", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: active ? TEXT : MUTED, fontFamily: "system-ui, sans-serif", fontWeight: active ? 600 : 400, fontSize: 14 }}>{ft.id}</span>
                {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD }} />}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
