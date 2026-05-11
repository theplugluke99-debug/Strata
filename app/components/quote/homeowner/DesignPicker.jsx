"use client";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER } from "../tokens";
import { DESIGNS } from "./data/designs";
import { COLOURS } from "./data/colours";

export default function DesignPicker({ flooringType, value = {}, onChange }) {
  const designs = DESIGNS[flooringType] ?? [];
  const selectedDesign = value.design ?? null;
  const selectedColour = value.colour ?? null;

  const colours = selectedDesign ? (COLOURS[selectedDesign] ?? []) : [];

  const cardW = flooringType === "Carpet" ? 90 : 120;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", gap: 12, minWidth: "min-content" }}>
          {designs.map((d) => {
            const active = selectedDesign === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onChange({ design: d.id, colour: null })}
                style={{
                  background: active ? GOLD_DIM : SURFACE,
                  border: `1px solid ${active ? GOLD : BORDER}`,
                  borderRadius: 12,
                  padding: 0,
                  cursor: "pointer",
                  width: cardW,
                  flexShrink: 0,
                  overflow: "hidden",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {d.svg ? (
                  <div style={{ height: 80, background: SURFACE2, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                    {d.svg}
                  </div>
                ) : d.img ? (
                  <div style={{ height: 80, background: SURFACE2, overflow: "hidden" }}>
                    <img src={d.img} alt={d.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : null}
                <div style={{ padding: "10px 10px 12px" }}>
                  <div style={{ color: active ? TEXT : MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, fontWeight: active ? 600 : 400, marginBottom: d.desc ? 3 : 0 }}>
                    {d.label}
                  </div>
                  {d.desc && (
                    <div style={{ color: "rgba(242,237,224,0.3)", fontFamily: "system-ui, sans-serif", fontSize: 10, lineHeight: 1.4 }}>
                      {d.desc}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {colours.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Colour
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {colours.map((c) => {
              const active = selectedColour === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => onChange({ design: selectedDesign, colour: c.name })}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: c.hex,
                    border: active ? `2px solid ${GOLD}` : "2px solid transparent",
                    boxShadow: active ? `0 0 0 2px rgba(201,169,110,0.3)` : "none",
                    transition: "all 0.2s",
                  }} />
                  <span style={{ color: active ? TEXT : MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, textAlign: "center", maxWidth: 52, lineHeight: 1.3 }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
