"use client";

import { useState, useEffect, useRef } from "react";

// ── Gallery ──────────────────────────────────────────────────────
const galleryImages = [
  { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=90&fit=crop&crop=center", label: "Bedroom · Carpet", sub: "Warm & comfortable" },
  { url: "https://images.unsplash.com/photo-1562113530-57ba467cea38?w=1200&q=90&fit=crop&crop=center", label: "Living Room · Herringbone", sub: "Statement oak pattern" },
  { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=90&fit=crop&crop=center", label: "Kitchen · LVT", sub: "Waterproof & practical" },
  { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=90&fit=crop&crop=center", label: "Living Room · Engineered Wood", sub: "Timeless & durable" },
];

// ── Flooring types ───────────────────────────────────────────────
const flooringTypes = [
  {
    name: "Carpet", tag: "Most popular", grade: true,
    desc: "Warm, textured, and making a serious comeback. Available in budget twist to premium wool-blend.",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=85&fit=crop",
    subfloorNote: null,
    grades: [
      { label: "Budget",  desc: "Hard-wearing twist pile. Great for rentals, stairs, and high-traffic areas." },
      { label: "Mid",     desc: "Comfortable underfoot with a good range of textures and colours. Most popular." },
      { label: "Premium", desc: "Wool-blend or luxury synthetic. Plush, long-lasting, and worth every penny." },
    ],
  },
  {
    name: "Herringbone", tag: "Trending now", grade: true,
    desc: "The V-shaped pattern that makes any room look considered. Engineered wood, LVT, or laminate.",
    img: "https://images.unsplash.com/photo-1562113530-57ba467cea38?w=400&q=85&fit=crop",
    subfloorNote: "Herringbone is unforgiving of an uneven subfloor — any dips or ridges will show in the pattern. Timber subfloors usually need ply boarding first. We'll check this at survey.",
    grades: [
      { label: "Budget",  desc: "Laminate herringbone. Realistic look, very affordable." },
      { label: "Mid",     desc: "Engineered wood. Real oak surface, more dimensionally stable than solid." },
      { label: "Premium", desc: "Solid hardwood. The real thing. Sanded and refinishable for decades." },
    ],
  },
  {
    name: "LVT", tag: "Best for wet rooms", grade: true,
    desc: "Luxury Vinyl Tile — fully waterproof, incredibly durable, and works in every room including kitchens and bathrooms.",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=85&fit=crop",
    subfloorNote: "LVT must go down on a perfectly flat surface — it's unforgiving of lumps. Concrete subfloors often need latex levelling compound. Timber subfloors usually need ply boarding. We'll assess and quote for this at survey.",
    grades: [
      { label: "Budget",  desc: "Glue-down LVT. Thin, flat, and practical." },
      { label: "Mid",     desc: "Click-fit LVT with built-in underlay. Easy to replace individual planks." },
      { label: "Premium", desc: "Karndean or Amtico-equivalent. Thicker wear layer, more realistic, longer warranty." },
    ],
  },
  {
    name: "Laminate", tag: "Great value", grade: true,
    desc: "Modern laminate is surprisingly good. Durable, clean lines, and a fraction of the cost of real wood.",
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=85&fit=crop",
    subfloorNote: "Laminate needs a flat, dry base. Concrete may need latex levelling. Timber boards should be screwed down with no flex or bounce before we start.",
    grades: [
      { label: "Budget",  desc: "8mm standard. Gets the job done well." },
      { label: "Mid",     desc: "10–12mm with acoustic underlay. Quieter and more solid underfoot." },
      { label: "Premium", desc: "12mm+ with premium underlay. The closest thing to real wood without the price tag." },
    ],
  },
  {
    name: "Vinyl", tag: "Practical & affordable", grade: true,
    desc: "Sheet vinyl or vinyl planks. Fully waterproof, soft underfoot, very easy to maintain.",
    img: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&q=85&fit=crop",
    subfloorNote: "Vinyl is thin, which means any bumps or old adhesive residue underneath will show through over time. The subfloor needs to be smooth and clean before we lay it.",
    grades: [
      { label: "Budget",  desc: "Sheet vinyl. Practical, hygienic, and very cost-effective." },
      { label: "Mid",     desc: "Cushioned vinyl or vinyl planks. Warmer and softer underfoot." },
      { label: "Premium", desc: "Heavy-duty commercial-grade or luxury vinyl planks. Extremely durable." },
    ],
  },
  {
    name: "Not sure yet", tag: "We'll guide you", grade: false,
    desc: "No problem at all. Our surveyor visits with samples across all types and price points. You choose in your own home.",
    img: null, subfloorNote: null, grades: [],
  },
];

// ── Wastage ──────────────────────────────────────────────────────
const WASTAGE = {
  "Carpet": 0.10, "LVT": 0.10, "Laminate": 0.10,
  "Herringbone": 0.15, "Vinyl": 0.10, "Not sure yet": 0.10,
};

// ── Rooms ────────────────────────────────────────────────────────
const RESIDENTIAL_ROOMS = [
  "Living Room","Bedroom","Hallway","Stairs","Dining Room",
  "Landing","Playroom","Home Office","Kitchen","Bathroom",
  "En-suite","Conservatory","Garage",
];
const COMMERCIAL_ROOMS = [
  "Office Space","Reception","Meeting Room","Corridor / Hallway",
  "Retail Floor","Warehouse","Showroom","Gym / Studio",
  "Restaurant / Café","Hotel Room","Bathroom / WC","Staff Room",
];

// ── Extras ───────────────────────────────────────────────────────
const EXTRAS_LIST = [
  { id: "uplift",    label: "Uplift & disposal",     desc: "We remove and responsibly dispose of your existing flooring." },
  { id: "ply",       label: "Ply boarding",           desc: "A layer of plywood screwed over your existing timber subfloor to create a perfectly smooth base. Usually needed before LVT or vinyl." },
  { id: "latex",     label: "Latex levelling",        desc: "Self-levelling compound poured over concrete to fill dips. Required for most hard floors laid on concrete." },
  { id: "gripper",   label: "New gripper rods",       desc: "Toothed strips fixed around the room perimeter that hold carpet in place. Usually included in supply & fit." },
  { id: "doorbar",   label: "Door bars / thresholds", desc: "The finishing strip where your new floor meets another surface. Available in standard silver, brushed chrome, or premium solid brass." },
  { id: "furniture", label: "Furniture moving",       desc: "We move and replace furniture before and after fitting. Heavy items and built-ins excluded — let us know at survey." },
  { id: "membrane",  label: "Moisture membrane",          desc: "A vapour barrier laid over ground-floor concrete to protect against rising damp. Recommended under LVT and laminate." },
  { id: "acoustic",  label: "Acoustic underlay upgrade",  desc: "Required in flats and apartments above ground floor. Significantly reduces impact noise — check your building's lease requirements." },
  { id: "skirting",  label: "Skirting board removal & refit", desc: "We carefully remove your existing skirting boards to allow a clean fit against the wall, then refit them neatly over your new floor." },
];

// ── Marquee / stats ──────────────────────────────────────────────
const marqueeItems = [
  { text: "Carpet", gold: true }, { text: "LVT", gold: false },
  { text: "Herringbone", gold: false }, { text: "Free Survey", gold: true },
  { text: "Vinyl", gold: false }, { text: "Vetted Fitters", gold: false },
  { text: "Fair Pricing", gold: true }, { text: "No Hidden Costs", gold: false },
  { text: "Supply & Fit", gold: false }, { text: "Fast Turnaround", gold: true },
];
const stats = [
  { value: "Free",  label: "Home survey & samples" },
  { value: "Fast",  label: "Turnaround from quote"  },
  { value: "Fair",  label: "Pricing. Always."        },
  { value: "Zero",  label: "Hidden costs. Ever."     },
];
const howItWorksSteps = [
  { num: "01", title: "Tell us what you need",      body: "Answer a few quick questions about your rooms and what you're after. No phone calls, no waiting." },
  { num: "02", title: "Get an instant estimate",    body: "See a real price range based on your rooms and flooring type — before you've spoken to anyone." },
  { num: "03", title: "We come to you",             body: "Our surveyor visits with samples chosen for your project. You choose in your own home, in your own light." },
  { num: "04", title: "No surprises on fitting day",body: "The price you agreed is the price you pay. Vetted fitters, everything included, nothing hidden." },
];


// ── Brand ────────────────────────────────────────────────────────
const s = {
  bg: "#111110", text: "#f2ede0", gold: "#c9a96e",
  card: "#1a1a18", border: "#2a2a28", dim: "rgba(242,237,224,0.45)",
  serif: "'Cormorant Garamond', Georgia, serif", sans: "system-ui, sans-serif",
};

// ── Shared UI ────────────────────────────────────────────────────
const Tag = ({ children }) => <div style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: s.gold, fontFamily: s.sans, marginBottom: "8px" }}>{children}</div>;
const Divider = () => <div style={{ width: "32px", height: "1px", background: s.gold, margin: "14px 0 18px" }} />;
const Sub = ({ children }) => <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.65, fontWeight: 300, marginBottom: "16px" }}>{children}</div>;
const GoldBtn = ({ children, onClick, disabled = false }) => {
  const [pressed, setPressed] = useState(false);
  const handleClick = () => {
    if (disabled || !onClick) return;
    setPressed(true);
    setTimeout(() => { setPressed(false); onClick(); }, 180);
  };
  return (
    <button onClick={handleClick} disabled={disabled} style={{ width: "100%", background: disabled ? "rgba(201,169,110,0.3)" : pressed ? "#a07840" : s.gold, color: "#111", border: "none", padding: "16px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: s.sans, transition: "background 0.1s" }}>{children}</button>
  );
};
const BackBtn = ({ onClick }) => {
  const [pressed, setPressed] = useState(false);
  const handleClick = () => {
    setPressed(true);
    setTimeout(() => { setPressed(false); onClick(); }, 180);
  };
  return (
    <button onClick={handleClick} style={{ background: "none", border: "none", color: pressed ? "rgba(242,237,224,0.6)" : "rgba(242,237,224,0.3)", fontFamily: s.sans, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", padding: "0", marginBottom: "16px", display: "block", transition: "color 0.1s" }}>← Back</button>
  );
};
const NavBtn = ({ children, onClick }) => {
  const [pressed, setPressed] = useState(false);
  const handleClick = () => {
    setPressed(true);
    setTimeout(() => { setPressed(false); onClick(); }, 180);
  };
  return (
    <button onClick={handleClick} style={{ background: pressed ? "rgba(242,237,224,0.05)" : "none", border: `1px solid ${s.border}`, color: s.dim, padding: "14px", borderRadius: "3px", cursor: "pointer", fontFamily: s.sans, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", transition: "background 0.1s", width: "100%" }}>{children}</button>
  );
};
const ProgressBar = ({ current, total }) => (
  <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ flex: 1, height: "2px", borderRadius: "1px", background: i < current ? s.gold : s.border, transition: "background 0.4s" }} />
    ))}
  </div>
);
const Chip = ({ label, selected, onClick }) => (
  <button onClick={onClick} style={{ background: selected ? s.gold : "transparent", border: `1px solid ${selected ? s.gold : s.border}`, color: selected ? "#111" : s.dim, padding: "11px 12px", borderRadius: "3px", fontSize: "13px", fontFamily: s.sans, cursor: "pointer", textAlign: "left", fontWeight: selected ? "600" : "400", transition: "all 0.2s" }}>{label}</button>
);
const GoldNote = ({ children }) => (
  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 14px", marginBottom: "14px", background: "rgba(201,169,110,0.07)", borderLeft: `2px solid ${s.gold}` }}>
    <span style={{ color: s.gold, fontSize: "7px", marginTop: "4px", flexShrink: 0 }}>◆</span>
    <p style={{ fontFamily: s.sans, fontSize: "11px", lineHeight: 1.7, color: "rgba(242,237,224,0.5)", margin: 0 }}>{children}</p>
  </div>
);

// ── Info Tooltip (alcove / bay window explainer) ─────────────────
function InfoTooltip({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "50%", width: "16px", height: "16px", color: s.gold, fontSize: "9px", fontWeight: 700, cursor: "pointer", fontFamily: s.sans, lineHeight: 1, padding: 0, verticalAlign: "middle", marginLeft: "6px" }}>?</button>
      {open && (
        <div style={{ position: "absolute", left: "0", top: "22px", zIndex: 10, background: "#1e1e1c", border: `1px solid ${s.border}`, borderRadius: "4px", padding: "12px 14px", width: "240px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <div style={{ fontFamily: s.serif, fontSize: "14px", fontWeight: 700, color: s.text, marginBottom: "6px" }}>{title}</div>
          <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, lineHeight: 1.65, fontWeight: 300 }}>{children}</div>
          <button onClick={() => setOpen(false)} style={{ marginTop: "8px", background: "none", border: "none", color: "rgba(242,237,224,0.3)", fontSize: "10px", cursor: "pointer", fontFamily: s.sans }}>Close</button>
        </div>
      )}
    </span>
  );
}

// ── Animated Phone Measure Demo ──────────────────────────────────
// Room layout (top-down bird's eye):
//   Top wall: skirting at y=26
//   Bottom wall: skirting at y=154, door gap at x=58–94, door bar at y=148 (INSIDE the room)
//   Left skirting x=36, right skirting x=204
//
// Key accuracy: the door bar sits INSIDE the room, proud of the skirting behind it.
// The length measurement runs from TOP skirting (y=26) DOWN to the door bar (y=148).
// The gap between door bar (y=148) and skirting (y=154) is clearly visible.
//
// Phases (1.8s each):
//   0 — idle, phone centre
//   1 — width line grows left→right
//   2 — width badge "4.5 m" appears
//   3 — width ghosts, length grows top→door bar (NOT skirting)
//   4 — length badge "3.8 m", gap between door bar and skirting highlighted
//   5 — both shown, reset
function PhoneMeasureDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 6), 1900);
    return () => clearInterval(t);
  }, []);

  // Phase 0: idle  1: length line grows up  2: length badge  3: length ghosts + width grows  4: width badge + gap  5: both + reset
  const showLength      = phase >= 1;
  const showLengthLabel = phase >= 2;
  const lengthFaded     = phase >= 3;
  const showWidth       = phase >= 3;
  const showWidthLabel  = phase >= 4;
  const showGap         = phase >= 4;
  const showBoth        = phase >= 5;

  const tr = "all 0.85s cubic-bezier(0.4,0,0.2,1)";

  // Phone follows the active measurement
  const phoneX = phase === 0 ? 120 : phase === 1 ? 155 : phase === 2 ? 155 : phase === 3 ? 50 : phase === 4 ? 185 : 120;
  const phoneY = phase === 0 ? 90  : phase === 1 ? 132 : phase === 2 ? 80  : phase === 3 ? 82 : phase === 4 ? 82  : 90;

  // Coords
  const ROOM_LEFT   = 36;   // left skirting inner edge
  const ROOM_RIGHT  = 204;  // right skirting inner edge
  const ROOM_TOP    = 26;   // top skirting inner edge
  const SKIRTING_B  = 154;  // bottom skirting inner edge (y)
  const DOORBAR_Y   = 147;  // door bar — where length measurement starts
  const DOOR_LEFT   = 60;
  const DOOR_RIGHT  = 96;

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width="240" height="195" viewBox="0 0 240 195" fill="none" xmlns="http://www.w3.org/2000/svg">

          {/* ── Room fill ── */}
          <rect x="30" y="20" width="180" height="140" rx="2"
            fill="rgba(201,169,110,0.04)" stroke="rgba(242,237,224,0.12)" strokeWidth="1.5"/>

          {/* ── Skirting boards ── */}
          <rect x="30" y="20" width="180" height="6" fill="rgba(242,237,224,0.07)"/>
          <rect x="30"       y={SKIRTING_B} width={DOOR_LEFT - 30} height="6" fill="rgba(242,237,224,0.07)"/>
          <rect x={DOOR_RIGHT} y={SKIRTING_B} width={210 - DOOR_RIGHT} height="6" fill="rgba(242,237,224,0.07)"/>
          <rect x="30" y="20" width="6" height="140" fill="rgba(242,237,224,0.07)"/>
          <rect x="204" y="20" width="6" height="140" fill="rgba(242,237,224,0.07)"/>

          {/* ── Skirting labels ── */}
          <text x="120" y="16" textAnchor="middle" fill="rgba(242,237,224,0.2)" fontSize="6" fontFamily="system-ui">skirting</text>
          <text x="18"  y="92" textAnchor="middle" fill="rgba(242,237,224,0.2)" fontSize="6" fontFamily="system-ui" transform="rotate(-90,18,92)">skirting</text>
          <text x="222" y="92" textAnchor="middle" fill="rgba(242,237,224,0.2)" fontSize="6" fontFamily="system-ui" transform="rotate(90,222,92)">skirting</text>

          {/* ── Floor board texture ── */}
          {[42, 60, 78, 96, 114, 132, 150].map(y => (
            <line key={y} x1={ROOM_LEFT} y1={y} x2={ROOM_RIGHT} y2={y}
              stroke="rgba(242,237,224,0.025)" strokeWidth="1"/>
          ))}

          {/* ── Door ── */}
          <path d={`M${DOOR_LEFT} ${SKIRTING_B} Q${DOOR_LEFT - 2} 126 ${DOOR_RIGHT} 126`}
            fill="rgba(201,169,110,0.03)" stroke="rgba(242,237,224,0.1)" strokeWidth="1" strokeDasharray="3 2"/>
          <line x1={DOOR_LEFT} y1={SKIRTING_B} x2={DOOR_RIGHT} y2="126"
            stroke="rgba(242,237,224,0.22)" strokeWidth="1.2"/>

          {/* ── Door bar — taller on room-facing side to show it protrudes into the room ── */}
          <rect x={DOOR_LEFT} y={DOORBAR_Y} width={DOOR_RIGHT - DOOR_LEFT} height="6" rx="1"
            fill="#c9a96e" stroke="#e8c47e" strokeWidth="1.2"/>

          {/* Gap between door bar and bottom skirting — highlighted in phase 4+ */}
          {showGap && (
            <rect x={DOOR_LEFT} y={DOORBAR_Y + 6} width={DOOR_RIGHT - DOOR_LEFT} height={SKIRTING_B - DOORBAR_Y - 6}
              fill="rgba(201,169,110,0.18)" style={{ transition: tr }}/>
          )}

          {/* Door bar label — always visible */}
          <text x="78" y={DOORBAR_Y - 3} textAnchor="middle"
            fill="#c9a96e" fontSize="6" fontFamily="system-ui" fontWeight="600">door bar</text>

          {/* "don't measure past here" annotation in phase 4+ */}
          {showGap && (
            <>
              <text x="118" y="152" textAnchor="start"
                fill="rgba(201,169,110,0.7)" fontSize="5.5" fontFamily="system-ui">← far edge of door bar</text>
              <line x1="116" y1="151" x2={DOOR_RIGHT + 2} y2="151"
                stroke="rgba(201,169,110,0.4)" strokeWidth="0.8"/>
            </>
          )}

          {/* ── LENGTH measurement line (door bar → top skirting, x=155) ── */}
          {/* Grows FROM door bar (y=147) UPWARD to top skirting (y=26) */}
          {showLength && (
            <>
              <line
                x1="155" y1={phase === 1 ? "95" : ROOM_TOP}
                x2="155" y2={DOORBAR_Y + 6}
                stroke="#c9a96e" strokeWidth="1.5" strokeDasharray="5 3"
                opacity={lengthFaded && !showBoth ? "0.15" : "0.9"}
                style={{ transition: tr }}
              />
              {/* Start dot — far (room-facing) edge of door bar */}
              <circle cx="155" cy={DOORBAR_Y + 6} r="3.5" fill="#c9a96e"
                opacity={lengthFaded && !showBoth ? "0.15" : "0.9"} style={{ transition: tr }}/>
              {/* End dot — top skirting, appears when line is fully extended */}
              {phase >= 2 && (
                <circle cx="155" cy={ROOM_TOP} r="3.5" fill="#c9a96e"
                  opacity={lengthFaded && !showBoth ? "0.15" : "0.9"} style={{ transition: tr }}/>
              )}
            </>
          )}
          {showLengthLabel && (
            <g opacity={lengthFaded && !showBoth ? "0.15" : "1"} style={{ transition: tr }}>
              <text x="192" y="65" textAnchor="middle"
                fill="rgba(242,237,224,0.3)" fontSize="5.5" fontFamily="system-ui">door bar to skirting</text>
              <rect x="168" y="68" width="48" height="16" rx="3"
                fill="#1a1a18" stroke="rgba(201,169,110,0.4)" strokeWidth="0.8"/>
              <text x="192" y="79" textAnchor="middle"
                fill="#c9a96e" fontSize="10" fontFamily="system-ui" fontWeight="600">3.8 m</text>
            </g>
          )}

          {/* ── WIDTH measurement line (left skirting → right skirting, y=82) ── */}
          {showWidth && (
            <>
              <line
                x1={ROOM_LEFT} y1="82"
                x2={phase === 3 ? "130" : ROOM_RIGHT} y2="82"
                stroke="#c9a96e" strokeWidth="1.5" strokeDasharray="5 3"
                opacity="0.9" style={{ transition: tr }}
              />
              <circle cx={ROOM_LEFT} cy="82" r="3.5" fill="#c9a96e" style={{ transition: tr }}/>
              {phase >= 4 && (
                <circle cx={ROOM_RIGHT} cy="82" r="3.5" fill="#c9a96e" style={{ transition: tr }}/>
              )}
            </>
          )}
          {showWidthLabel && (
            <g style={{ transition: tr }}>
              <text x="120" y="72" textAnchor="middle"
                fill="rgba(242,237,224,0.3)" fontSize="6.5" fontFamily="system-ui">width</text>
              <rect x="96" y="73" width="48" height="16" rx="3"
                fill="#1a1a18" stroke="rgba(201,169,110,0.4)" strokeWidth="0.8"/>
              <text x="120" y="84" textAnchor="middle"
                fill="#c9a96e" fontSize="10" fontFamily="system-ui" fontWeight="600">4.5 m</text>
            </g>
          )}

          {/* ── Phone ── */}
          <g transform={`translate(${phoneX},${phoneY})`} style={{ transition: tr }}>
            <rect x="-9" y="-18" width="18" height="32" rx="3"
              fill="#1e1e1c" stroke="#c9a96e" strokeWidth="1.1"/>
            <rect x="-6" y="-14" width="12" height="20" rx="1"
              fill="rgba(201,169,110,0.1)"/>
            <circle cx="0" cy="11" r="1.8" fill="rgba(201,169,110,0.25)"/>
            <circle cx="0" cy="-16" r="1.8"
              fill={phase === 1 || phase === 3 ? "#c9a96e" : "rgba(201,169,110,0.2)"}
              style={{ transition: tr }}/>
            <line x1="-3" y1="-4" x2="3"  y2="-4" stroke="#c9a96e" strokeWidth="0.8" opacity="0.8"/>
            <line x1="0"  y1="-7" x2="0"  y2="-1" stroke="#c9a96e" strokeWidth="0.8" opacity="0.8"/>
          </g>

        </svg>
      </div>

      {/* Caption */}
      <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, textAlign: "center", lineHeight: 1.6, minHeight: "36px" }}>
        {phase === 0 && "Bird's eye view — point your phone at the floor"}
        {phase === 1 && "Stand at the door bar — measure up to the top skirting"}
        {phase === 2 && "Length: 3.8 m ✓ — door bar to top skirting"}
        {phase === 3 && "Now measure width: left skirting to right skirting"}
        {phase === 4 && "Width: 4.5 m ✓ — measure to the far edge of the door bar — your flooring tucks underneath it"}
        {phase === 5 && "Both measurements done — ready to quote"}
      </div>
    </div>
  );
}

// ── Measure Education ────────────────────────────────────────────
function MeasureEducationScreen({ onContinue }) {
  const tips = [
    {
      icon: "📏",
      title: "Skirting board to skirting board — not wall to wall",
      body: "Place your start point at the base of one skirting board and measure across to the base of the opposite one. This is the exact footprint your flooring needs to cover — measuring wall to wall gives you the wrong number.",
    },
    {
      icon: "🚪",
      title: "Door bars — always include the threshold",
      body: "Measure to the door bar or threshold — whichever represents the widest or longest point of the room. The door bar sits at the entrance and your flooring runs right up to it. If you measure short of it, your quote will be short too. When in doubt, measure a little long.",
    },
    {
      icon: "🪟",
      title: "Bay windows — the main room, then the drop-back",
      body: "Don't try to measure the bay in one go. First measure your main room rectangle as normal. Then measure the bay separately: its width (how wide the opening is) × its drop-back (how far it projects into the room). We add these together as two rectangles.",
    },
    {
      icon: "📦",
      title: "Alcoves — width × depth",
      body: "An alcove is a recess set back into the wall — most commonly found either side of a chimney breast in living rooms and bedrooms. Measure the width of the opening and the depth of how far it goes back. These are their own rectangle and get added to your main room total.",
    },
    {
      icon: "🪜",
      title: "Stairs — count the treads",
      body: "Don't measure the length of your staircase. Instead, count each individual step from the very bottom to the very top — these are called treads. Include any half-landing treads. We calculate the material needed from your tread count.",
    },
  ];

  return (
    <div>
      {/* Phone demo */}
      <div style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.18)", borderRadius: "4px", padding: "20px 18px", marginBottom: "16px" }}>
        <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: "14px", textAlign: "center" }}>
          Use your phone's Measure app
        </div>
        <PhoneMeasureDemo />
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {["iPhone — Measure app (built-in)", "Android — Measure app (built-in)"].map(l => (
            <div key={l} style={{ fontFamily: s.sans, fontSize: "10px", color: "rgba(201,169,110,0.7)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "2px", padding: "4px 10px" }}>{l}</div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div style={{ fontFamily: s.sans, fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>
        How to measure each area
      </div>
      {tips.map((tip, i) => (
        <div key={i} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "3px", padding: "14px 16px", marginBottom: "6px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "2px" }}>{tip.icon}</span>
          <div>
            <div style={{ fontFamily: s.serif, fontSize: "15px", fontWeight: 700, color: s.text, marginBottom: "4px" }}>{tip.title}</div>
            <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, lineHeight: 1.7, fontWeight: 300 }}>{tip.body}</div>
          </div>
        </div>
      ))}

      <GoldNote>Rough figures are completely fine. Our surveyor confirms exact measurements in person before any price is finalised — no obligation at any stage.</GoldNote>
      <GoldBtn onClick={onContinue}>I'm ready to measure →</GoldBtn>
    </div>
  );
}

// ── Room Calculator ──────────────────────────────────────────────
function getRoomGrossM2(room, data, flooringType) {
  const wastage = WASTAGE[flooringType] || 0.10;
  if (room === "Stairs") return parseInt(data?.treads || 0) * 0.25 * (1 + wastage);
  const main = parseFloat(data?.l || 0) * parseFloat(data?.w || 0);
  const bay  = data?.hasBay ? parseFloat(data?.bayL || 0) * parseFloat(data?.bayD || 0) : 0;
  const alc  = data?.hasAlc ? parseFloat(data?.alcW || 0) * parseFloat(data?.alcD || 0) : 0;
  return (main + bay + alc) * (1 + wastage);
}

function RoomCalculator({ room, data, onChange, flooringType }) {
  const isStairs   = room === "Stairs";
  const wastageRate = WASTAGE[flooringType] || 0.10;
  const wastageLabel = flooringType === "Herringbone" ? "15% wastage" : "10% wastage";
  const mainM2  = parseFloat(data?.l || 0) * parseFloat(data?.w || 0);
  const bayM2   = data?.hasBay ? parseFloat(data?.bayL || 0) * parseFloat(data?.bayD || 0) : 0;
  const alcM2   = data?.hasAlc ? parseFloat(data?.alcW || 0) * parseFloat(data?.alcD || 0) : 0;
  const stairM2 = isStairs ? parseInt(data?.treads || 0) * 0.25 : 0;
  const netM2   = isStairs ? stairM2 : (mainM2 + bayM2 + alcM2);
  const grossM2 = netM2 * (1 + wastageRate);
  const set = (key, val) => onChange({ ...data, [key]: val });

  const inp = { background: "transparent", border: "none", borderBottom: "1px solid rgba(242,237,224,0.2)", color: s.text, fontFamily: s.serif, fontSize: "22px", padding: "6px 0", width: "100%", outline: "none" };
  const ml  = (txt) => <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "6px" }}>{txt}</div>;

  return (
    <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", marginBottom: "10px", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans }}>{room}</div>
        {grossM2 > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: s.serif, fontSize: "18px", color: s.gold, fontWeight: 600 }}>{grossM2.toFixed(1)} m²</div>
            <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.25)", fontFamily: s.sans }}>inc. {wastageLabel}</div>
          </div>
        )}
      </div>
      <div style={{ padding: "12px 16px 16px" }}>
        {isStairs ? (
          <div>
            <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "12px", lineHeight: 1.6 }}>Count each individual step (tread) from bottom to top. Include half-landings.</div>
            {ml("Number of treads")}
            <input style={{ ...inp, fontSize: "28px" }} type="number" placeholder="0" min="0" value={data?.treads || ""} onChange={e => set("treads", e.target.value)}/>
          </div>
        ) : (
          <>
            {ml("Main room")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "4px" }}>
              <div>{ml("Length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.l || ""} onChange={e => set("l", e.target.value)}/></div>
              <div>{ml("Width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.w || ""} onChange={e => set("w", e.target.value)}/></div>
            </div>
            {mainM2 > 0 && <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginBottom: "12px" }}>{parseFloat(data.l).toFixed(1)} × {parseFloat(data.w).toFixed(1)} = {mainM2.toFixed(2)} m²</div>}

            {/* Bay window toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasBay ? "10px" : "6px" }}>
              <div onClick={() => set("hasBay", !data?.hasBay)} style={{ background: data?.hasBay ? "rgba(201,169,110,0.12)" : "transparent", border: `1px solid ${data?.hasBay ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasBay ? s.gold : "rgba(242,237,224,0.3)", fontFamily: s.sans, fontSize: "11px", padding: "7px 12px", cursor: "pointer", flex: 1, transition: "all 0.2s" }}>
                {data?.hasBay ? "✓ " : "+ "}Bay window
              </div>
              <InfoTooltip title="What's a bay window?">
                A bay window projects outward from the main wall of a room, creating a recess or bump-out. They're common in Victorian and Edwardian homes. Measure the main room first, then measure the bay separately — its width × how far it extends into the room.
              </InfoTooltip>
            </div>
            {data?.hasBay && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginBottom: "10px" }}>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "8px", lineHeight: 1.5 }}>Bay width × how far it drops back into the room. Do not measure diagonally.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>{ml("Bay width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.bayL || ""} onChange={e => set("bayL", e.target.value)}/></div>
                  <div>{ml("Drop-back (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.bayD || ""} onChange={e => set("bayD", e.target.value)}/></div>
                </div>
                {bayM2 > 0 && <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginTop: "6px" }}>Bay: {bayM2.toFixed(2)} m²</div>}
              </div>
            )}

            {/* Alcove toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasAlc ? "10px" : "0" }}>
              <div onClick={() => set("hasAlc", !data?.hasAlc)} style={{ background: data?.hasAlc ? "rgba(201,169,110,0.12)" : "transparent", border: `1px solid ${data?.hasAlc ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasAlc ? s.gold : "rgba(242,237,224,0.3)", fontFamily: s.sans, fontSize: "11px", padding: "7px 12px", cursor: "pointer", flex: 1, transition: "all 0.2s" }}>
                {data?.hasAlc ? "✓ " : "+ "}Alcove
              </div>
              <InfoTooltip title="What's an alcove?">
                An alcove is a recess built into a wall — most commonly found either side of a chimney breast in living rooms and bedrooms. They look like a smaller rectangular space set back from the main room. Measure the width of the opening and how deep it goes back into the wall.
              </InfoTooltip>
            </div>
            {data?.hasAlc && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)" }}>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "8px", lineHeight: 1.5 }}>The width of the alcove opening × how deep it goes back into the wall.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>{ml("Alcove width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.alcW || ""} onChange={e => set("alcW", e.target.value)}/></div>
                  <div>{ml("Alcove depth (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.alcD || ""} onChange={e => set("alcD", e.target.value)}/></div>
                </div>
                {alcM2 > 0 && <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginTop: "6px" }}>Alcove: {alcM2.toFixed(2)} m²</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── AI Quote Block ───────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

function AIQuoteBlock({ quoteData }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    if (!quoteData) return;
    const run = async () => {
      try {
        const res  = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(quoteData) });
        const data = await res.json();
        if (data.success && data.estimate) setEstimate(data.estimate);
        else setError(true);
      } catch { setError(true); }
      finally  { setLoading(false); }
    };
    run();
  }, [quoteData]);

  const wrap = { background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "2px", padding: "28px 22px", marginBottom: "28px" };

  if (loading) return (
    <div style={wrap}>
      <style>{`@keyframes strataShimmer{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>
      <div style={{ height: "9px", width: "130px", borderRadius: "2px", background: "rgba(201,169,110,0.2)", marginBottom: "18px", animation: "strataShimmer 1.6s ease-in-out infinite" }}/>
      <div style={{ height: "52px", width: "88%", borderRadius: "2px", background: "rgba(201,169,110,0.12)", marginBottom: "10px", animation: "strataShimmer 1.6s ease-in-out infinite" }}/>
      <div style={{ height: "52px", width: "65%", borderRadius: "2px", background: "rgba(201,169,110,0.08)", animation: "strataShimmer 1.6s ease-in-out infinite" }}/>
    </div>
  );

  if (error || !estimate) return (
    <div style={wrap}><p style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, margin: 0, fontStyle: "italic" }}>Our team will include a full estimate in your survey confirmation.</p></div>
  );

  return (
    <div style={wrap}>
      <div style={{ fontFamily: s.sans, fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: s.gold, marginBottom: "14px" }}>Indicative Estimate</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "22px" }}>
        <span style={{ fontFamily: s.serif, fontSize: "clamp(36px,9vw,58px)", fontWeight: 300, color: s.text, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmt(estimate.lowEstimate)}</span>
        <span style={{ fontFamily: s.serif, fontSize: "clamp(24px,6vw,38px)", fontWeight: 300, color: "rgba(242,237,224,0.3)", lineHeight: 1 }}>–</span>
        <span style={{ fontFamily: s.serif, fontSize: "clamp(36px,9vw,58px)", fontWeight: 300, color: s.text, lineHeight: 1, letterSpacing: "-0.02em" }}>{fmt(estimate.highEstimate)}</span>
      </div>
      <div style={{ width: "100%", height: "1px", background: "rgba(201,169,110,0.15)", marginBottom: "18px" }}/>
      {estimate.breakdown?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "18px" }}>
          {estimate.breakdown.map((line, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontFamily: s.sans, fontSize: "12px", color: "rgba(242,237,224,0.4)", flex: 1 }}>{line.label}</span>
              <span style={{ fontFamily: s.serif, fontSize: "16px", fontWeight: 500, color: s.text, whiteSpace: "nowrap" }}>
                {fmt(line.low)}{line.high && line.high !== line.low ? ` – ${fmt(line.high)}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
      {estimate.leadTime && <p style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.35)", margin: "0 0 16px 0" }}>Estimated lead time: <span style={{ color: s.text }}>{estimate.leadTime}</span></p>}
      <GoldNote>This estimate is based on your inputs. Final pricing is confirmed at your free on-site survey — no obligation, no surprises.</GoldNote>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function StrataPage() {
  const [activeGallery,    setActiveGallery]    = useState(0);
  const [scrollY,          setScrollY]          = useState(0);
  const [step,             setStep]             = useState(0);
  const [measureSubStep,   setMeasureSubStep]   = useState("educate");
  const [propertyType,     setPropertyType]     = useState("");
  const [selectedRooms,    setSelectedRooms]    = useState([]);
  const [bedroomCount,     setBedroomCount]     = useState(1);
  const [dimensions,       setDimensions]       = useState({});
  const [selectedFlooring, setSelectedFlooring] = useState("");
  const [flooringGrade,    setFlooringGrade]    = useState("");
  const [currentFloor,     setCurrentFloor]     = useState("");
  const [subfloor,         setSubfloor]         = useState("");
  const [selectedExtras,   setSelectedExtras]   = useState([]);
  const [budget,           setBudget]           = useState("");
  const [timing,           setTiming]           = useState("");
  const [serviceType,      setServiceType]      = useState("");
  const [name,             setName]             = useState("");
  const [phone,            setPhone]            = useState("");
  const [postcode,         setPostcode]         = useState("");
  const [submitted,        setSubmitted]        = useState(false);
  const [step2Sub,         setStep2Sub]         = useState("path");
  const [flooringPath,     setFlooringPath]     = useState("know");
  const [helpDescription,  setHelpDescription]  = useState("");
  const [recommendations,  setRecommendations]  = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [roomConfigs,      setRoomConfigs]      = useState({});
  const [pathChoice,       setPathChoice]       = useState(null);
  const refCode = useRef("STR-2026-" + Math.floor(1000 + Math.random() * 9000));

  const expandedRooms = selectedRooms.flatMap(r =>
    r === "Bedroom" ? Array.from({ length: bedroomCount }, (_, i) => bedroomCount === 1 ? "Bedroom" : `Bedroom ${i + 1}`) : [r]
  );
  const totalGrossM2 = expandedRooms.reduce((acc, r) => {
    const roomFlooring = roomConfigs[r]?.flooring || selectedFlooring;
    return acc + getRoomGrossM2(r, dimensions[r], roomFlooring);
  }, 0);
  const quoteData = {
    rooms: expandedRooms, propertyType,
    flooringType: selectedFlooring, flooringGrade,
    currentFloor, subfloorType: subfloor,
    extras: selectedExtras, budget, timing, serviceType,
    totalGrossM2: totalGrossM2.toFixed(2),
    roomConfigs,
  };

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setActiveGallery(p => (p + 1) % galleryImages.length), 4500);
    return () => clearInterval(t);
  }, []);
  const toggleRoom    = (r)  => setSelectedRooms(p => p.includes(r)  ? p.filter(x => x !== r)  : [...p, r]);
  const toggleExtra   = (id) => setSelectedExtras(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const setDim        = (room, data) => setDimensions(p => ({ ...p, [room]: data }));
  const setRoomConfig = (room, key, val) => setRoomConfigs(p => ({ ...p, [room]: { ...(p[room] || {}), [key]: val } }));
  const nameValid      = name.trim().length >= 2;
  const phoneDigits    = phone.replace(/\D/g, "");
  const phoneValid     = phoneDigits.length >= 10;
  const postcodeClean  = postcode.trim().replace(/\s/g, "");
  const postcodeValid  = postcodeClean.length >= 5 && /^[A-Za-z]{1,2}\d/.test(postcodeClean);
  const canSubmit      = nameValid && phoneValid && postcodeValid;
  const roomsToUse     = propertyType === "Commercial" ? COMMERCIAL_ROOMS : RESIDENTIAL_ROOMS;
  const allRoomsHaveFlooring = expandedRooms.length > 0 && expandedRooms.every(r => !!(roomConfigs[r]?.flooring || selectedFlooring));
  const currentEncouragement =
    step === 0 ? "Most people are done with this in under 2 minutes — let's get you a real price." :
    step === 1 && measureSubStep === "educate" ? "Take your time with this — accurate measurements mean a more accurate quote." :
    step === 1 && measureSubStep === "measure" ? "Rough figures are completely fine. Our surveyor confirms everything in person." :
    step === 2 && step2Sub === "path" ? "No wrong answer here — if you're not sure what you want, we'll figure it out together." :
    step === 2 && step2Sub === "help" ? "The more detail you give us, the better we can match you to the right floor." :
    step === 2 && step2Sub === "room-config" ? "You're doing brilliantly. This is the last detailed bit — nearly at your estimate." :
    step === 3 ? "This helps us bring exactly the right crew and materials on the day." :
    step === 4 ? "Almost there — just a couple more quick questions." :
    step === 5 ? "Last step. Your estimate is waiting on the other side of this." : null;

  const stepTitles = [
    "Your project",
    measureSubStep === "educate" ? "Before you measure" : "Measure your rooms",
    step2Sub === "help" ? "Tell us what you need" : step2Sub === "room-config" ? "Configure your rooms" : "What flooring?",
    "Current floor & extras",
    "Budget & timing",
    "Almost done.",
  ];

  const scrollToQuote = () => {
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: s.bg, color: s.text, minHeight: "100vh", overflowX: "hidden", fontFamily: s.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .gi { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 1.4s ease; }
        .mq-track { display: flex; gap: 48px; animation: mq 28s linear infinite; white-space: nowrap; will-change: transform; }
        @keyframes mq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .row-card { background: #1a1a18; border: 1px solid #2a2a28; border-radius: 4px; padding: 14px 16px; margin-bottom: 6px; }
        .floor-card { border: 1px solid #2a2a28; border-radius: 4px; overflow: hidden; display: flex; cursor: pointer; transition: border-color 0.2s; margin-bottom: 6px; }
        .floor-card:hover { border-color: #c9a96e; }
        .mat-card { border-radius: 6px; overflow: hidden; position: relative; height: 110px; cursor: pointer; }
        .mat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; display: block; }
        .mat-card:hover img { transform: scale(1.05); }
        .lbl { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(17,17,16,0.95) 0%, transparent 100%); padding: 10px 12px; }
        .stat-box { background: #1a1a18; border: 1px solid #2a2a28; padding: 18px 14px; transition: border-color 0.3s; }
        .stat-box:hover { border-color: rgba(201,169,110,0.25); }
        .step-card { position: relative; background: #1a1a18; border: 1px solid #2a2a28; padding: 16px 16px 16px 48px; margin-bottom: 4px; overflow: hidden; }
        .inp { background: transparent; border: none; border-bottom: 1px solid rgba(242,237,224,0.2); color: #f2ede0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; padding: 8px 0; width: 100%; outline: none; transition: border-color 0.2s; }
        .inp:focus { border-bottom-color: #c9a96e; }
        .inp::placeholder { color: rgba(242,237,224,0.15); }
        .nav-link { color: rgba(242,237,224,0.45); text-decoration: none; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; transition: color 0.2s; }
        .nav-link:hover { color: #f2ede0; }
        .nav-links { display: none !important; }
        .nav-cta-mobile { display: block; }
        @media (min-width: 480px) { .nav-links { display: flex !important; gap: 24px; align-items: center; } .nav-cta-mobile { display: none; } }
        @media (min-width: 640px) { .hero-h1 { font-size: 52px !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: scrollY > 60 ? "rgba(17,17,16,0.95)" : "transparent", backdropFilter: scrollY > 60 ? "blur(16px)" : "none", borderBottom: scrollY > 60 ? `1px solid ${s.border}` : "none", transition: "all 0.4s", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: s.serif, fontSize: "20px", fontWeight: 700, letterSpacing: "0.12em", color: s.text }}>STRATA</div>
        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#about" className="nav-link">About</a>
          <a href="/" onClick={e => { e.preventDefault(); scrollToQuote(); }} style={{ background: s.gold, color: "#111", padding: "9px 20px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "2px" }}>Free quote</a>
        </div>
        <a href="/" onClick={e => { e.preventDefault(); scrollToQuote(); }} className="nav-cta-mobile" style={{ background: s.gold, color: "#111", padding: "8px 14px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: "2px" }}>Free quote</a>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {galleryImages.map((img, i) => <img key={i} src={img.url} alt={img.label} className="gi" style={{ opacity: i === activeGallery ? 1 : 0 }}/>)}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(17,17,16,0.1) 0%, rgba(17,17,16,0.7) 45%, rgba(17,17,16,1) 88%)" }}/>
        </div>
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 20px 80px" }}>
          <div style={{ position: "absolute", top: "64px", right: "20px", textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans }}>{galleryImages[activeGallery].label}</div>
            <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.28)", letterSpacing: "0.08em", fontFamily: s.sans, marginTop: "2px" }}>{galleryImages[activeGallery].sub}</div>
          </div>
          <div style={{ background: s.gold, color: "#111", fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", padding: "5px 12px", display: "inline-block", marginBottom: "14px", textTransform: "uppercase", fontFamily: s.sans, alignSelf: "flex-start" }}>Quote in 60 seconds — free</div>
          <h1 className="hero-h1" style={{ fontFamily: s.serif, fontSize: "40px", fontWeight: 700, color: s.text, lineHeight: 1.0, marginBottom: "12px" }}>
            New floors.<br />The price up front.<br /><span style={{ color: s.gold, fontStyle: "italic" }}>Nothing hidden.</span>
          </h1>
          <p style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.7, fontWeight: 300, marginBottom: "20px", maxWidth: "320px" }}>
            Instant estimate. Free home survey with samples. Vetted fitters. The price you're quoted is the price you pay.
          </p>
          <a href="/" onClick={e => { e.preventDefault(); scrollToQuote(); }} style={{ background: s.gold, color: "#111", padding: "16px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "3px", display: "block", textAlign: "center", marginBottom: "10px" }}>Get my free quote →</a>
          <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", textAlign: "center", fontFamily: s.sans }}>Free survey · No obligation · Fair pricing</div>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "16px" }}>
            {galleryImages.map((_, i) => (
              <button key={i} onClick={() => setActiveGallery(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ width: i === activeGallery ? "22px" : "6px", height: "2px", background: i === activeGallery ? s.gold : "rgba(242,237,224,0.2)", borderRadius: "1px", transition: "all 0.4s" }}/>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ overflow: "hidden", borderTop: `1px solid ${s.border}`, borderBottom: `1px solid ${s.border}`, padding: "14px 0", background: "rgba(201,169,110,0.04)" }}>
        <div className="mq-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ fontFamily: s.sans, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: item.gold ? s.gold : "rgba(242,237,224,0.25)", flexShrink: 0 }}>{item.text}</span>
          ))}
        </div>
      </div>

      {/* WHY */}
      <section style={{ padding: "48px 20px" }}>
        <Tag>The Strata difference</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "28px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "8px" }}>
          Most fitters make<br />you wait days.<br /><span style={{ color: s.gold, fontStyle: "italic" }}>We don't.</span>
        </div>
        <Divider />
        {[
          { title: "Instant estimate — before you speak to anyone", body: "Answer a few questions and see a real price range straight away. No waiting for a callback that may never come." },
          { title: "No showroom. No markup.",                        body: "High street flooring brands build their retail overheads and sales commissions into every quote. We don't have any of that — and that's the point." },
          { title: "Free survey — we come to you",                  body: "We bring samples chosen for your rooms directly to your home. You choose in your own light, against your own walls, with no pressure." },
          { title: "No surprises on fitting day",                   body: "The price you're quoted is the price you pay. Everything agreed before a single tool comes out of the van." },
        ].map((item, i) => (
          <div key={i} className="row-card">
            <div style={{ fontSize: "10px", color: s.gold, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "5px" }}>{item.title}</div>
            <div style={{ fontSize: "12px", color: s.dim, lineHeight: 1.6, fontWeight: 300, fontFamily: s.sans }}>{item.body}</div>
          </div>
        ))}
      </section>

      {/* STATS */}
      <section style={{ padding: "0 20px 48px" }}>
        <Tag>By the numbers</Tag>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          {stats.map((st, i) => (
            <div key={i} className="stat-box">
              <div style={{ fontFamily: s.serif, fontSize: "32px", fontWeight: 700, color: s.gold, lineHeight: 1 }}>{st.value}</div>
              <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginTop: "4px" }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "0 20px 48px" }}>
        <Tag>How it works</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "16px" }}>
          Straightforward from<br /><span style={{ color: s.gold, fontStyle: "italic" }}>start to finish</span>
        </div>
        {howItWorksSteps.map((st, i) => (
          <div key={i} className="step-card">
            <div style={{ fontFamily: s.serif, fontSize: "52px", fontWeight: 700, color: "rgba(201,169,110,0.08)", position: "absolute", top: "-4px", left: "8px", lineHeight: 1, userSelect: "none" }}>{st.num}</div>
            <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "5px" }}>Step {st.num}</div>
            <div style={{ fontFamily: s.serif, fontSize: "18px", fontWeight: 700, color: s.text, marginBottom: "6px" }}>{st.title}</div>
            <div style={{ fontSize: "12px", color: s.dim, lineHeight: 1.6, fontWeight: 300, fontFamily: s.sans }}>{st.body}</div>
          </div>
        ))}
      </section>

      {/* MATERIALS */}
      <section style={{ padding: "0 20px 48px" }}>
        <Tag>What's popular right now</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "16px" }}>
          The floors people <span style={{ color: s.gold, fontStyle: "italic" }}>actually</span> want
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          {flooringTypes.filter(f => f.img).map((f, i) => (
            <div key={i} className="mat-card">
              <img src={f.img} alt={f.name}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,16,0.95) 0%, transparent 55%)" }}/>
              <div className="lbl">
                <div style={{ fontFamily: s.serif, fontSize: "15px", fontWeight: 700, color: s.text }}>{f.name}</div>
                <div style={{ fontFamily: s.sans, fontSize: "9px", color: s.gold, marginTop: "2px" }}>{f.tag}</div>
              </div>
            </div>
          ))}
        </div>
        <a href="/" onClick={e => { e.preventDefault(); scrollToQuote(); }} style={{ display: "block", textAlign: "center", background: s.gold, color: "#111", padding: "16px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "3px" }}>Get my free quote →</a>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: "48px 20px", borderTop: `1px solid ${s.border}` }}>
        <Tag>Who we are</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "8px" }}>
          A new business.<br />Two decades of<br /><span style={{ color: s.gold, fontStyle: "italic" }}>flooring know-how.</span>
        </div>
        <Divider />
        <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "16px" }}>
          Strata is a new business — and we'll be straight with you about that. What we're not new to is flooring. The people behind Strata have over two decades of hands-on experience across Essex and London, covering everything from period-property timber subfloors to large-scale commercial fits.
        </div>
        <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "16px" }}>
          We started Strata because getting new flooring has always been a worse experience than the floor itself. Callbacks that don't come. Quotes that change on the day. Fitters who leave before you've checked the edges. We've seen it from the inside, and we built something better.
        </div>
        <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "24px" }}>
          No showroom. No sales team. No inflated margins. Just people who know flooring, a transparent process, and a simple rule: the price you're quoted is the price you pay.
        </div>
        {[
          { stat: "20+",           label: "Years of hands-on flooring expertise" },
          { stat: "Essex & London",label: "Our home territory — and growing" },
          { stat: "£0",            label: "Hidden costs. Ever." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "14px 0", borderBottom: `1px solid ${s.border}` }}>
            <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.gold, lineHeight: 1, flexShrink: 0, minWidth: "100px" }}>{item.stat}</div>
            <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, lineHeight: 1.6, paddingTop: "4px" }}>{item.label}</div>
          </div>
        ))}
      </section>

      {/* QUOTE FORM */}
      <section id="quote" style={{ padding: "48px 20px 80px", background: "rgba(201,169,110,0.025)", borderTop: `1px solid ${s.border}` }}>
        <Tag>Free instant quote</Tag>

        {submitted ? (
          <div style={{ paddingTop: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ width: "54px", height: "54px", borderRadius: "50%", border: `1.5px solid ${s.gold}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px", color: s.gold }}>✓</div>
              <div style={{ fontFamily: s.serif, fontSize: "32px", fontWeight: 700, color: s.text, lineHeight: 1.05, marginBottom: "10px" }}>
                You're in,<br /><span style={{ color: s.gold, fontStyle: "italic" }}>{name.split(" ")[0]}.</span>
              </div>
              <p style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.7, fontWeight: 300, maxWidth: "280px", margin: "0 auto" }}>
                We'll call you back as soon as we can to confirm your free survey — someone who actually knows flooring will be on the other end of the phone.
              </p>
            </div>

            <AIQuoteBlock quoteData={quoteData} />

            <Divider />
            {[
              "We'll call you back as soon as possible to confirm your free survey time",
              "Our surveyor visits with samples chosen for your rooms and budget",
              "Price agreed. No surprises on fitting day. Ever.",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `1px solid ${s.gold}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px" }}>
                  <span style={{ fontSize: "9px", color: s.gold, fontWeight: 600, fontFamily: s.sans }}>{i + 1}</span>
                </div>
                <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.6, fontWeight: 300 }}>{t}</div>
              </div>
            ))}

            <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", padding: "16px", marginTop: "24px", textAlign: "center" }}>
              <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim, marginBottom: "6px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Your reference</div>
              <div style={{ fontFamily: s.serif, fontSize: "22px", color: s.gold, letterSpacing: "0.1em" }}>{refCode.current}</div>
            </div>
          </div>

        ) : (
          <>
            <div style={{ fontFamily: s.serif, fontSize: "28px", fontWeight: 700, color: s.text, lineHeight: 1.05, marginBottom: "8px" }}>{stepTitles[step]}</div>
            <Divider />
            <ProgressBar current={step + 1} total={6} />
            {currentEncouragement && (
              <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.35)", lineHeight: 1.6, marginBottom: "16px", fontStyle: "italic" }}>{currentEncouragement}</div>
            )}

            {/* STEP 0 */}
            {step === 0 && (
              <>
                <Sub>First — is this a home or a commercial space?</Sub>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                  {["Residential","Commercial"].map(type => (
                    <button key={type} onClick={() => { setPropertyType(type); setSelectedRooms([]); }} style={{ background: propertyType === type ? s.gold : "transparent", border: `1px solid ${propertyType === type ? s.gold : s.border}`, color: propertyType === type ? "#111" : s.dim, padding: "16px 12px", borderRadius: "3px", fontSize: "14px", fontFamily: s.serif, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.04em" }}>{type}</button>
                  ))}
                </div>
                {propertyType && (
                  <>
                    <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "10px" }}>Which {propertyType === "Commercial" ? "spaces" : "rooms"} need new flooring?</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "16px" }}>
                      {roomsToUse.map(r => <Chip key={r} label={r} selected={selectedRooms.includes(r)} onClick={() => toggleRoom(r)}/>)}
                    </div>
                    {propertyType === "Residential" && selectedRooms.includes("Bedroom") && (
                      <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", padding: "14px 16px", marginBottom: "16px" }}>
                        <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "10px" }}>How many bedrooms?</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <button onClick={() => setBedroomCount(Math.max(1, bedroomCount - 1))} style={{ width: "36px", height: "36px", borderRadius: "50%", border: `1px solid ${s.border}`, background: "transparent", color: s.text, fontSize: "20px", cursor: "pointer" }}>−</button>
                          <span style={{ fontFamily: s.serif, fontSize: "32px", color: s.gold, fontWeight: 300, minWidth: "32px", textAlign: "center" }}>{bedroomCount}</span>
                          <button onClick={() => setBedroomCount(Math.min(8, bedroomCount + 1))} style={{ width: "36px", height: "36px", borderRadius: "50%", border: `1px solid ${s.border}`, background: "transparent", color: s.text, fontSize: "20px", cursor: "pointer" }}>+</button>
                          <span style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim }}>{bedroomCount === 1 ? "bedroom" : "bedrooms"}</span>
                        </div>
                      </div>
                    )}
                    <GoldBtn onClick={() => { setStep(1); setMeasureSubStep("educate"); }} disabled={selectedRooms.length === 0}>Continue →</GoldBtn>
                  </>
                )}
              </>
            )}

            {/* STEP 1a */}
            {step === 1 && measureSubStep === "educate" && (
              <>
                <BackBtn onClick={() => setStep(0)}/>
                <MeasureEducationScreen onContinue={() => setMeasureSubStep("measure")}/>
              </>
            )}

            {/* STEP 1b */}
            {step === 1 && measureSubStep === "measure" && (
              <>
                <BackBtn onClick={() => setMeasureSubStep("educate")}/>
                <Sub>Enter your measurements room by room.</Sub>
                {expandedRooms.map(room => (
                  <RoomCalculator key={room} room={room} data={dimensions[room] || {}} onChange={data => setDim(room, data)} flooringType={selectedFlooring}/>
                ))}
                {totalGrossM2 > 0 && (
                  <div style={{ background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "3px", padding: "14px 16px", marginTop: "8px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: s.sans, fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "3px" }}>Total to order</div>
                      <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.3)" }}>Includes {selectedFlooring === "Herringbone" ? "15%" : "10%"} wastage allowance</div>
                    </div>
                    <div style={{ fontFamily: s.serif, fontSize: "32px", color: s.gold, fontWeight: 300 }}>{totalGrossM2.toFixed(1)} <span style={{ fontSize: "16px" }}>m²</span></div>
                  </div>
                )}
                <GoldBtn onClick={() => { setStep(2); setStep2Sub("path"); }}>Continue →</GoldBtn>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                {/* PATH — choose how to proceed */}
                {step2Sub === "path" && (
                  <>
                    <BackBtn onClick={() => { setStep(1); setMeasureSubStep("measure"); }}/>
                    <Sub>How would you like to choose your flooring?</Sub>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                      <button onClick={() => setPathChoice("know")} style={{ background: pathChoice === "know" ? "rgba(201,169,110,0.1)" : s.card, border: `1px solid ${pathChoice === "know" ? s.gold : s.border}`, borderRadius: "4px", padding: "22px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", width: "100%" }}>
                        <div style={{ fontFamily: s.serif, fontSize: "22px", fontWeight: 700, color: pathChoice === "know" ? s.gold : s.text, marginBottom: "6px" }}>I know what I want</div>
                        <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, fontWeight: 300, lineHeight: 1.5 }}>Browse flooring types and select your grade</div>
                        {pathChoice === "know" && <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, marginTop: "8px" }}>✓ Selected</div>}
                      </button>
                      <button onClick={() => setPathChoice("help")} style={{ background: pathChoice === "help" ? "rgba(201,169,110,0.1)" : "rgba(201,169,110,0.03)", border: `1px solid ${pathChoice === "help" ? s.gold : "rgba(201,169,110,0.3)"}`, borderRadius: "4px", padding: "22px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", width: "100%" }}>
                        <div style={{ fontFamily: s.serif, fontSize: "22px", fontWeight: 700, color: pathChoice === "help" ? s.gold : s.text, marginBottom: "6px" }}>Help me choose</div>
                        <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, fontWeight: 300, lineHeight: 1.5 }}>Describe your home and we'll recommend the best flooring for each room</div>
                        {pathChoice === "help" && <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, marginTop: "8px" }}>✓ Selected</div>}
                      </button>
                    </div>
                    {pathChoice && <GoldBtn onClick={() => setStep2Sub(pathChoice)}>Continue →</GoldBtn>}
                  </>
                )}

                {/* KNOW — existing flooring type cards */}
                {step2Sub === "know" && (
                  <>
                    <BackBtn onClick={() => setStep2Sub("path")}/>
                    <Sub>Not sure? Our surveyor brings samples — choose in your own home.</Sub>
                    {flooringTypes.map(f => (
                      <div key={f.name}>
                        <div className="floor-card" onClick={() => { setSelectedFlooring(f.name); setFlooringGrade(""); }} style={{ borderColor: selectedFlooring === f.name ? s.gold : s.border }}>
                          {f.img && <img src={f.img} alt={f.name} style={{ width: "72px", height: "64px", objectFit: "cover", flexShrink: 0 }}/>}
                          <div style={{ padding: "10px 12px", flex: 1, background: selectedFlooring === f.name ? "#1a1918" : "transparent" }}>
                            <div style={{ fontFamily: s.serif, fontSize: "16px", fontWeight: 700, color: s.text, marginBottom: "3px" }}>{f.name}</div>
                            <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, fontWeight: 300 }}>{f.desc}</div>
                            {selectedFlooring === f.name && <div style={{ fontSize: "9px", color: s.gold, fontFamily: s.sans, marginTop: "4px" }}>✓ Selected</div>}
                          </div>
                          <div style={{ padding: "10px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                            <div style={{ fontSize: "9px", color: s.gold, fontFamily: s.sans, letterSpacing: "0.06em", textAlign: "right" }}>{f.tag}</div>
                          </div>
                        </div>
                        {selectedFlooring === f.name && f.subfloorNote && <GoldNote>{f.subfloorNote}</GoldNote>}
                        {selectedFlooring === f.name && f.grade && f.grades.length > 0 && (
                          <div style={{ background: "#161614", border: `1px solid rgba(201,169,110,0.15)`, borderRadius: "0 0 4px 4px", padding: "14px 16px", marginBottom: "6px" }}>
                            <div style={{ fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "10px" }}>Which grade?</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {f.grades.map(g => (
                                <button key={g.label} onClick={() => setFlooringGrade(g.label)} style={{ background: flooringGrade === g.label ? "rgba(201,169,110,0.12)" : "transparent", border: `1px solid ${flooringGrade === g.label ? s.gold : s.border}`, borderRadius: "3px", padding: "10px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                                  <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: flooringGrade === g.label ? s.gold : s.text, marginBottom: "3px" }}>{g.label}</div>
                                  <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, fontWeight: 300 }}>{g.desc}</div>
                                </button>
                              ))}
                            </div>
                            <div style={{ fontFamily: s.sans, fontSize: "10px", color: "rgba(242,237,224,0.2)", marginTop: "10px", lineHeight: 1.5 }}>Exact pricing per grade confirmed at survey. Our surveyor brings samples from all tiers.</div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ marginTop: "16px" }}>
                      <GoldBtn onClick={() => { setFlooringPath("know"); setStep2Sub("room-config"); }} disabled={!selectedFlooring}>Configure rooms →</GoldBtn>
                    </div>
                  </>
                )}

                {/* HELP — AI recommendation flow */}
                {step2Sub === "help" && (
                  <>
                    <BackBtn onClick={() => { if (!recommendLoading) setStep2Sub("path"); }}/>
                    <Sub>Describe your home and what you're looking for — our AI will recommend the best flooring for each room.</Sub>
                    <style>{`@keyframes strataShimmer{0%,100%{opacity:.35}50%{opacity:.9}}`}</style>

                    {!recommendLoading && (
                      <>
                        <textarea
                          value={helpDescription}
                          onChange={e => setHelpDescription(e.target.value)}
                          placeholder="e.g. Something warm for the bedrooms, easy to clean for the kitchen, we have underfloor heating and a dog..."
                          rows={5}
                          style={{ width: "100%", background: s.card, border: `1px solid ${s.border}`, borderRadius: "3px", color: s.text, fontFamily: s.sans, fontSize: "13px", padding: "14px", resize: "vertical", outline: "none", marginBottom: "16px", lineHeight: 1.6 }}
                        />
                        <GoldBtn
                          onClick={async () => {
                            setRecommendLoading(true);
                            setRecommendations(null);
                            try {
                              const res = await fetch("/api/recommend", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ description: helpDescription, rooms: expandedRooms, propertyType }),
                              });
                              const data = await res.json();
                              setRecommendations(data);
                            } catch {
                              setRecommendations({ error: true });
                            } finally {
                              setRecommendLoading(false);
                            }
                          }}
                          disabled={!helpDescription.trim()}
                        >
                          {recommendations && !recommendations.error ? "Get new recommendation →" : "Get recommendation →"}
                        </GoldBtn>
                      </>
                    )}

                    {recommendLoading && (
                      <div>
                        {expandedRooms.map(r => (
                          <div key={r} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", marginBottom: "10px", overflow: "hidden" }}>
                            <div style={{ height: "120px", background: "rgba(201,169,110,0.06)", animation: "strataShimmer 1.6s ease-in-out infinite" }}/>
                            <div style={{ padding: "14px 16px" }}>
                              <div style={{ height: "8px", width: "80px", background: "rgba(201,169,110,0.2)", borderRadius: "2px", marginBottom: "10px", animation: "strataShimmer 1.6s ease-in-out infinite" }}/>
                              <div style={{ height: "32px", width: "90%", background: "rgba(201,169,110,0.08)", borderRadius: "2px", animation: "strataShimmer 1.6s ease-in-out infinite" }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {recommendations && !recommendations.error && !recommendLoading && (
                      <>
                        {recommendations.generalAdvice && <GoldNote>{recommendations.generalAdvice}</GoldNote>}
                        {recommendations.recommendations?.map(rec => (
                          <div key={rec.room} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", marginBottom: "12px", overflow: "hidden" }}>
                            {rec.unsplashPhoto && (
                              <img src={rec.unsplashPhoto} alt={rec.room} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }}/>
                            )}
                            <div style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                                <span style={{ fontFamily: s.serif, fontSize: "16px", fontWeight: 700, color: s.text }}>{rec.room}</span>
                                <span style={{ fontFamily: s.sans, fontSize: "9px", color: "#111", background: s.gold, padding: "2px 8px", borderRadius: "2px", fontWeight: 600, letterSpacing: "0.06em" }}>{rec.flooringType}</span>
                                <span style={{ fontFamily: s.sans, fontSize: "9px", color: s.gold, border: `1px solid ${s.gold}`, padding: "2px 8px", borderRadius: "2px", letterSpacing: "0.06em" }}>{rec.grade}</span>
                              </div>
                              <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, lineHeight: 1.6, fontWeight: 300 }}>{rec.reason}</div>
                              {rec.warning && <GoldNote>{rec.warning}</GoldNote>}
                            </div>
                          </div>
                        ))}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                          <GoldBtn onClick={() => {
                            const newConfigs = {};
                            recommendations.recommendations?.forEach(rec => {
                              newConfigs[rec.room] = { ...(roomConfigs[rec.room] || {}), flooring: rec.flooringType, grade: rec.grade };
                            });
                            setRoomConfigs(p => ({ ...p, ...newConfigs }));
                            const floorings = recommendations.recommendations?.map(r => r.flooringType) || [];
                            const mostCommon = floorings.sort((a, b) =>
                              floorings.filter(v => v === b).length - floorings.filter(v => v === a).length
                            )[0];
                            if (mostCommon) setSelectedFlooring(mostCommon);
                            setFlooringPath("help");
                            setStep2Sub("room-config");
                          }}>
                            Use these recommendations →
                          </GoldBtn>
                          <NavBtn onClick={() => { setRecommendations(null); setHelpDescription(""); setStep2Sub("know"); }}>Choose myself</NavBtn>
                        </div>
                      </>
                    )}

                    {recommendations?.error && !recommendLoading && (
                      <>
                        <GoldNote>We couldn't generate recommendations right now. Please choose your flooring manually.</GoldNote>
                        <GoldBtn onClick={() => { setRecommendations(null); setStep2Sub("know"); }}>Choose myself →</GoldBtn>
                      </>
                    )}
                  </>
                )}

                {/* ROOM CONFIG — per-room configuration */}
                {step2Sub === "room-config" && (
                  <>
                    <BackBtn onClick={() => setStep2Sub(flooringPath)}/>
                    <Sub>Select a flooring type for each room, then configure the details.</Sub>

                    {/* Flooring selection summary — one tile per room */}
                    <div style={{ fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "10px" }}>Flooring per room</div>
                    {expandedRooms.map(room => {
                      const roomFlooring = roomConfigs[room]?.flooring || selectedFlooring || "";
                      const hasFlooring  = !!roomFlooring;
                      return (
                        <div key={room} style={{ background: hasFlooring ? s.card : "rgba(201,169,110,0.06)", border: `1px solid ${hasFlooring ? s.border : s.gold}`, borderRadius: "4px", padding: "12px 16px", marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase" }}>{room}</div>
                            {hasFlooring
                              ? <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.gold, fontWeight: 600 }}>✓ {roomFlooring}</div>
                              : <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, letterSpacing: "0.06em" }}>Select flooring ↓</div>
                            }
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {flooringTypes.filter(f => f.name !== "Not sure yet").map(f => (
                              <Chip key={f.name} label={f.name} selected={roomFlooring === f.name} onClick={() => setRoomConfig(room, "flooring", f.name)}/>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {!allRoomsHaveFlooring && (
                      <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.3)", textAlign: "center", padding: "10px 0 4px", fontStyle: "italic" }}>
                        Select a flooring type for each room above to continue
                      </div>
                    )}

                    {/* Detailed config cards — only shown once all rooms have flooring */}
                    {allRoomsHaveFlooring && (
                      <>
                        <div style={{ fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "10px", marginTop: "20px" }}>Room details</div>
                        {expandedRooms.map(room => {
                          const config       = roomConfigs[room] || {};
                          const roomFlooring = config.flooring || selectedFlooring || "";
                          const roomGrade    = config.grade    || flooringGrade    || "";
                          return (
                            <div key={room} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", padding: "16px", marginBottom: "12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase" }}>{room}</div>
                                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.gold, fontWeight: 600 }}>{roomFlooring}</div>
                              </div>

                              <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Grade</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                {["Budget", "Mid", "Premium"].map(g => (
                                  <Chip key={g} label={g} selected={roomGrade === g} onClick={() => setRoomConfig(room, "grade", g)}/>
                                ))}
                              </div>

                              <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Current floor covering</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                {["Carpet", "Hard floor", "Tiles", "Vinyl", "Bare"].map(o => (
                                  <Chip key={o} label={o} selected={config.currentFloor === o} onClick={() => setRoomConfig(room, "currentFloor", o)}/>
                                ))}
                              </div>

                              {/* Carpet-specific */}
                              {roomFlooring === "Carpet" && (
                                <>
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Style</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                                    {["Twist pile", "Berber", "Saxony", "Wilton", "Cut and loop"].map(o => (
                                      <Chip key={o} label={o} selected={config.style === o} onClick={() => setRoomConfig(room, "style", o)}/>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Underlay</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                                    {["Keep existing", "Replace — Budget 7mm", "Replace — Mid 10mm", "Replace — Premium 12mm+"].map(o => (
                                      <Chip key={o} label={o} selected={config.underlay === o} onClick={() => setRoomConfig(room, "underlay", o)}/>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "6px" }}>Acoustic underlay needed?</div>
                                  <GoldNote>Required in flats and apartments above ground floor.</GoldNote>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {["Yes", "No", "Not sure"].map(o => (
                                      <Chip key={o} label={o} selected={config.acoustic === o} onClick={() => setRoomConfig(room, "acoustic", o)}/>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Gripper rods</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {["Replace all", "Top up", "Not needed"].map(o => (
                                      <Chip key={o} label={o} selected={config.gripper === o} onClick={() => setRoomConfig(room, "gripper", o)}/>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Edge finishing</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {[
                                      { id: "None" },
                                      { id: "Whipping",  desc: "Edges stitched for a clean, durable finish" },
                                      { id: "Binding",   desc: "Fabric tape bound around edge — more decorative than whipping" },
                                    ].map(({ id, desc }) => (
                                      <button key={id} onClick={() => setRoomConfig(room, "edgeFinish", id)} style={{ background: config.edgeFinish === id ? "rgba(201,169,110,0.12)" : "transparent", border: `1px solid ${config.edgeFinish === id ? s.gold : s.border}`, borderRadius: "3px", padding: "10px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                                        <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: config.edgeFinish === id ? s.gold : s.text }}>{id}</div>
                                        {desc && <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, fontWeight: 300, marginTop: "2px" }}>{desc}</div>}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* LVT / Vinyl-specific */}
                              {(roomFlooring === "LVT" || roomFlooring === "Vinyl") && (
                                <>
                                  {subfloor === "Concrete" && <GoldNote>Concrete subfloors often need latex levelling before {roomFlooring} can be laid. We'll assess at survey.</GoldNote>}
                                  {subfloor === "Timber / boards" && <GoldNote>Timber subfloors usually need ply boarding before {roomFlooring} is laid. We'll assess at survey.</GoldNote>}
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px", marginTop: "4px" }}>Ply boarding needed?</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                                    {["Yes", "No", "Not sure"].map(o => (
                                      <Chip key={o} label={o} selected={config.plyBoarding === o} onClick={() => setRoomConfig(room, "plyBoarding", o)}/>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* Herringbone-specific */}
                              {roomFlooring === "Herringbone" && (
                                <GoldNote>15% wastage already applied for the herringbone pattern. Your subfloor must be perfectly flat — we'll check this at survey.</GoldNote>
                              )}
                            </div>
                          );
                        })}
                        <GoldBtn onClick={() => setStep(3)}>All rooms configured — continue →</GoldBtn>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <BackBtn onClick={() => { setStep(2); setStep2Sub("room-config"); }}/>
                <Sub>This helps us quote accurately for any prep work before your new floor goes down.</Sub>
                <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>What's there now?</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "18px" }}>
                  {["Carpet","Hard floor","Tiles","Vinyl","Bare / nothing"].map(o => <Chip key={o} label={o} selected={currentFloor === o} onClick={() => setCurrentFloor(o)}/>)}
                </div>
                <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "6px" }}>Subfloor type</div>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "10px", lineHeight: 1.6, fontWeight: 300 }}>Tap your floor — hollow sound means timber boards underneath. Solid and doesn't flex means concrete. This affects what prep is needed.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                  {["Concrete","Timber / boards"].map(o => <Chip key={o} label={o} selected={subfloor === o} onClick={() => setSubfloor(o)}/>)}
                </div>
                {subfloor === "Concrete" && (selectedFlooring === "LVT" || selectedFlooring === "Laminate" || selectedFlooring === "Vinyl") && (
                  <GoldNote>Concrete subfloors often need latex levelling compound before {selectedFlooring} can be laid. This fills any dips or uneven areas and creates a perfectly smooth base. We'll assess this at survey.</GoldNote>
                )}
                {subfloor === "Timber / boards" && (selectedFlooring === "LVT" || selectedFlooring === "Vinyl") && (
                  <GoldNote>Timber subfloors usually need ply boarding before {selectedFlooring} is laid. This creates a smooth, stable surface and prevents board movement or ridges telegraphing through your new floor over time.</GoldNote>
                )}
                <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px", marginTop: "4px" }}>Additional services</div>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "12px", fontWeight: 300, lineHeight: 1.6 }}>Select anything you'll need — we'll include these in your estimate.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
                  {EXTRAS_LIST.map(ex => (
                    <button key={ex.id} onClick={() => toggleExtra(ex.id)} style={{ background: selectedExtras.includes(ex.id) ? "rgba(201,169,110,0.1)" : "transparent", border: `1px solid ${selectedExtras.includes(ex.id) ? s.gold : s.border}`, borderRadius: "3px", padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                        <span style={{ fontFamily: s.sans, fontSize: "13px", fontWeight: 600, color: selectedExtras.includes(ex.id) ? s.gold : s.text }}>{ex.label}</span>
                        {selectedExtras.includes(ex.id) && <span style={{ fontSize: "10px", color: s.gold, fontFamily: s.sans }}>✓</span>}
                      </div>
                      <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, fontWeight: 300, lineHeight: 1.5 }}>{ex.desc}</div>
                    </button>
                  ))}
                </div>
                <GoldBtn onClick={() => setStep(4)}>Continue →</GoldBtn>
              </>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <>
                <BackBtn onClick={() => setStep(3)}/>
                <Sub>This helps us bring the right samples and materials to your survey.</Sub>
                <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Rough budget</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "18px" }}>
                  {["Under £500","£500–£1,500","£1,500–£3,000","£3,000+"].map(o => <Chip key={o} label={o} selected={budget === o} onClick={() => setBudget(o)}/>)}
                </div>
                <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>When do you need it?</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "18px" }}>
                  {["ASAP","Within a month","1–3 months","Just exploring"].map(o => <Chip key={o} label={o} selected={timing === o} onClick={() => setTiming(o)}/>)}
                </div>
                <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "6px" }}>Supply & fit or fit only?</div>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "10px", fontWeight: 300, lineHeight: 1.6 }}>Supply & fit — we provide everything. Fit only — you've sourced your own materials and just need our fitters.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "22px" }}>
                  {["Supply & fit","Fit only"].map(o => <Chip key={o} label={o} selected={serviceType === o} onClick={() => setServiceType(o)}/>)}
                </div>
                <GoldBtn onClick={() => setStep(5)}>Last step →</GoldBtn>
              </>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <>
                <BackBtn onClick={() => setStep(4)}/>
                <Sub>So we can confirm your free survey — someone who actually knows flooring will call you back.</Sub>
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Your name</div>
                    <input className="inp" type="text" placeholder="First name" value={name} onChange={e => setName(e.target.value)}/>
                    {name && !nameValid && <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.gold, marginTop: "6px" }}>Please enter at least 2 characters</div>}
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Phone number</div>
                    <input className="inp" type="text" placeholder="07700 000000" value={phone} onChange={e => setPhone(e.target.value)}/>
                    {phone && !phoneValid && <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.gold, marginTop: "6px" }}>Please enter a valid UK phone number (at least 10 digits)</div>}
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Postcode</div>
                    <input className="inp" type="text" placeholder="SW1A 1AA" value={postcode} onChange={e => setPostcode(e.target.value)}/>
                    {postcode && !postcodeValid && <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.gold, marginTop: "6px" }}>Please enter a valid UK postcode (e.g. SW1A 1AA)</div>}
                  </div>
                </div>
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", padding: "14px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "12px" }}>Your quote summary</div>
                  {[
                    ["Type",          propertyType],
                    ["Rooms",         expandedRooms.join(", ")],
                    ["Total area",    totalGrossM2 > 0 ? `${totalGrossM2.toFixed(1)} m² (inc. wastage)` : "To confirm"],
                    ["Flooring",      selectedFlooring + (flooringGrade ? ` — ${flooringGrade}` : "")],
                    ["Current floor", currentFloor],
                    ["Subfloor",      subfloor],
                    ["Extras",        selectedExtras.map(id => EXTRAS_LIST.find(e => e.id === id)?.label).filter(Boolean).join(", ")],
                    ["Budget",        budget],
                    ["Timing",        timing],
                    ["Service",       serviceType],
                  ].filter(([, v]) => v).map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontFamily: s.sans, fontSize: "12px", color: s.dim, padding: "6px 0", borderBottom: `1px solid rgba(242,237,224,0.05)` }}>
                      <span style={{ opacity: 0.5 }}>{label}</span>
                      <span style={{ textAlign: "right", maxWidth: "60%" }}>{val}</span>
                    </div>
                  ))}
                </div>
                <GoldBtn onClick={() => {
                  setSubmitted(true);
                  fetch("/api/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      reference_number: refCode.current,
                      property_type:    propertyType,
                      rooms:            expandedRooms.join(", "),
                      total_m2:         parseFloat(totalGrossM2),
                      flooring_type:    selectedFlooring,
                      flooring_grade:   flooringGrade,
                      current_floor:    currentFloor,
                      subfloor_type:    subfloor,
                      extras:           selectedExtras.join(", "),
                      budget_range:     budget,
                      timing:           timing,
                      service_type:     serviceType,
                      name:             name,
                      phone:            phone,
                      postcode:         postcode,
                      room_configs:     JSON.stringify(roomConfigs),
                      status:           "New",
                    }),
                  }).catch(() => {});
                }} disabled={!canSubmit}>Book my free survey</GoldBtn>
                <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.18)", textAlign: "center", fontFamily: s.sans, marginTop: "10px", lineHeight: 1.6 }}>
                  We'll call you back as soon as possible.<br />No obligation. No hard sell. Ever.
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "40px 20px", borderTop: `1px solid ${s.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ fontFamily: s.serif, fontSize: "20px", fontWeight: 700, letterSpacing: "0.1em" }}>STRATA</div>
        <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.2)" }}>© 2026 Strata · Essex & London · All rights reserved.</div>
      </footer>
    </div>
  );
}