"use client";
import { useState, useEffect } from "react";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER } from "../tokens";

// ── SVG Pile Type Cards ─────────────────────────────────────────────────────

function TwistSVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[10, 20, 30, 40, 50].map((x) => (
        <g key={x}>
          <path d={`M${x-3},70 C${x-5},55 ${x+1},45 ${x-3},30 C${x-5},15 ${x+1},5 ${x-3},2`} stroke="rgba(201,169,110,0.7)" strokeWidth="2" strokeLinecap="round"/>
          <path d={`M${x+3},70 C${x+5},55 ${x-1},45 ${x+3},30 C${x+5},15 ${x-1},5 ${x+3},2`} stroke="rgba(201,169,110,0.4)" strokeWidth="2" strokeLinecap="round"/>
        </g>
      ))}
    </svg>
  );
}

function LoopSVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const cx = 10 + col * 18;
          const cy = 60 - row * 22;
          return (
            <path
              key={`${row}-${col}`}
              d={`M${cx-6},${cy} C${cx-6},${cy-16} ${cx+6},${cy-16} ${cx+6},${cy}`}
              stroke="rgba(201,169,110,0.75)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          );
        })
      )}
      <line x1="4" y1="66" x2="56" y2="66" stroke="rgba(201,169,110,0.2)" strokeWidth="1.5"/>
    </svg>
  );
}

function SaxonySVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[8, 16, 24, 32, 40, 48, 56].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="70" x2={x - 2 + (i % 2) * 4} y2="6" stroke="rgba(201,169,110,0.6)" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx={x - 2 + (i % 2) * 4} cy="6" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.35)"/>
        </g>
      ))}
    </svg>
  );
}

function BerberSVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[0,1,2,3].map((row) =>
        [0,1,2,3,4].map((col) => {
          const cx = 6 + col * 12;
          const cy = 12 + row * 16;
          const offset = (row % 2) * 6;
          return (
            <path
              key={`${row}-${col}`}
              d={`M${cx+offset-4},${cy} C${cx+offset-4},${cy-8} ${cx+offset+4},${cy-8} ${cx+offset+4},${cy}`}
              stroke="rgba(201,169,110,0.65)"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          );
        })
      )}
    </svg>
  );
}

function ShaggySVG() {
  const strands = [
    [10, 4, 8, 70], [18, 2, 20, 68], [26, 6, 24, 72], [34, 3, 36, 70],
    [42, 5, 40, 72], [50, 2, 52, 68], [14, 5, 12, 65], [22, 3, 26, 67],
    [30, 4, 28, 71], [38, 2, 40, 66], [46, 5, 44, 70],
  ];
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {strands.map(([x1, y1, x2, y2], i) => (
        <path
          key={i}
          d={`M${x1},${y2} C${x1 + 4},${(y1 + y2) / 2} ${x2 - 3},${(y1 + y2) / 2 - 8} ${x2},${y1}`}
          stroke={`rgba(201,169,110,${0.4 + (i % 3) * 0.15})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}

// ── Design Data ─────────────────────────────────────────────────────────────

const DESIGNS = {
  Carpet: [
    { id: "twist",   label: "Twist",   desc: "Durable, practical, hides footprints",   svg: <TwistSVG /> },
    { id: "loop",    label: "Loop",    desc: "Textured, resilient, great for hallways", svg: <LoopSVG /> },
    { id: "saxony",  label: "Saxony",  desc: "Luxurious, formal, cut pile",             svg: <SaxonySVG /> },
    { id: "berber",  label: "Berber",  desc: "Natural look, flat weave, hardwearing",   svg: <BerberSVG /> },
    { id: "shaggy",  label: "Shaggy",  desc: "Tactile, cosy, barefoot comfort",         svg: <ShaggySVG /> },
  ],
  LVT: [
    { id: "lvt-wood",    label: "Wood Effect",          img: "/woodeffect-lvt-design.png" },
    { id: "lvt-stone",   label: "Stone Effect",         img: "/stone-lvt-design.png" },
    { id: "lvt-abstract",label: "Abstract / Contemporary", img: "/geometric-lvt-design.png" },
  ],
  Laminate: [
    { id: "lam-light",  label: "Light Oak",   img: "/white-washed-laminate-design.png" },
    { id: "lam-dark",   label: "Dark Oak",    img: "/dark-walnut-laminate-design.png" },
    { id: "lam-grey",   label: "Grey",        img: "/grey-smoked-laminate-design.png" },
    { id: "lam-herring",label: "Herringbone", img: "/herringbone-design.png" },
  ],
  Vinyl: [
    { id: "vinyl-plain", label: "Plain / Solid",  img: "/plain-vinyl-design.png" },
    { id: "vinyl-wood",  label: "Wood Effect",    img: "/wood-effect-style-vinyl.webp" },
    { id: "vinyl-tile",  label: "Tile Effect",    img: "/tile-effect-style-vinyl-png.webp" },
  ],
};

const COLOURS = {
  "twist":        [{ hex: "#d0cac0", name: "Dove Grey" }, { hex: "#c8b590", name: "Warm Sand" }, { hex: "#525250", name: "Charcoal" }, { hex: "#c4a0a0", name: "Blush" }, { hex: "#8aaa88", name: "Sage" }],
  "loop":         [{ hex: "#ede8dc", name: "Natural" }, { hex: "#d0c8a8", name: "Oatmeal" }, { hex: "#8a8888", name: "Slate" }, { hex: "#786870", name: "Dusk" }],
  "saxony":       [{ hex: "#ede0c8", name: "Cream" }, { hex: "#c8b07a", name: "Champagne" }, { hex: "#9a9890", name: "Pewter" }, { hex: "#1a2a48", name: "Midnight" }],
  "berber":       [{ hex: "#f0ece0", name: "Ivory" }, { hex: "#d8c898", name: "Straw" }, { hex: "#a08858", name: "Hazel" }, { hex: "#787068", name: "Flint" }],
  "shaggy":       [{ hex: "#eee8d8", name: "Cream" }, { hex: "#c89858", name: "Caramel" }, { hex: "#b0b0b0", name: "Silver" }, { hex: "#6a4868", name: "Plum" }],
  "lvt-wood":     [{ hex: "#d8b87a", name: "Blonde Oak" }, { hex: "#a07848", name: "Mid Oak" }, { hex: "#5a3820", name: "Walnut" }, { hex: "#8a8070", name: "Smoked Oak" }],
  "lvt-stone":    [{ hex: "#f0ece8", name: "Marble" }, { hex: "#d0c8b8", name: "Limestone" }, { hex: "#888080", name: "Slate" }, { hex: "#6a6460", name: "Dark Slate" }],
  "lvt-abstract": [{ hex: "#d0d0c8", name: "Light Grey" }, { hex: "#909088", name: "Mid Grey" }, { hex: "#484840", name: "Charcoal" }, { hex: "#a09080", name: "Warm Taupe" }],
  "lam-light":    [{ hex: "#e8dcc8", name: "White Oak" }, { hex: "#d0b880", name: "Natural Oak" }, { hex: "#c0a060", name: "Honey" }, { hex: "#b8a888", name: "Greige" }],
  "lam-dark":     [{ hex: "#7a5030", name: "Rustic Oak" }, { hex: "#503828", name: "Espresso" }, { hex: "#2a2018", name: "Ebony" }, { hex: "#6a4030", name: "Walnut" }],
  "lam-grey":     [{ hex: "#d0d0c8", name: "Pearl" }, { hex: "#a0a098", name: "Pebble" }, { hex: "#686860", name: "Storm" }, { hex: "#484840", name: "Graphite" }],
  "lam-herring":  [{ hex: "#d8c898", name: "Sandy" }, { hex: "#b09058", name: "Oak" }, { hex: "#7a6040", name: "Dark" }, { hex: "#a0988a", name: "Grey" }],
  "vinyl-plain":  [{ hex: "#ede8dc", name: "Linen" }, { hex: "#909088", name: "Slate" }, { hex: "#484840", name: "Charcoal" }, { hex: "#f0f0ec", name: "White" }],
  "vinyl-wood":   [{ hex: "#d4b07a", name: "Light" }, { hex: "#a07848", name: "Natural" }, { hex: "#6a4028", name: "Dark" }, { hex: "#8a8a78", name: "Grey Wood" }],
  "vinyl-tile":   [{ hex: "#f0ece8", name: "Porcelain" }, { hex: "#b0b0a8", name: "Stone Grey" }, { hex: "#787870", name: "Slate" }, { hex: "#4a4848", name: "Anthracite" }],
};

// ── Component ────────────────────────────────────────────────────────────────

export default function DesignPicker({ flooringType, value = {}, onChange }) {
  const designs = DESIGNS[flooringType] ?? [];
  const selectedDesign = value.design ?? null;
  const selectedColour = value.colour ?? null;

  const colours = selectedDesign ? (COLOURS[selectedDesign] ?? []) : [];

  const cardW = flooringType === "Carpet" ? 90 : 120;

  return (
    <div style={{ width: "100%" }}>
      {/* Design cards */}
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

      {/* Colour swatches */}
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
