"use client";

import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import FloSection from "./components/FloSection";

// ── Hero gallery — responsive image sets ─────────────────────────
const mobileImages = [
  { url: "/mobile-1.png", pos: "center center", label: "Stair Runner",              sub: "Precision fitted · Every step covered" },
  { url: "/mobile-2.png", pos: "center center", label: "Herringbone LVT Kitchen",   sub: "Waterproof · Durable · Underfloor heating compatible" },
  { url: "/mobile-3.png", pos: "center center", label: "Carpet Living Room",        sub: "Warm underfoot · Timeless style" },
  { url: "/mobile-4.png", pos: "center center", label: "Bedroom Carpet",            sub: "Deeply soft · Bedroom perfection · Warm underfoot" },
];
const desktopImages = [
  { url: "/desktop-1.png", pos: "center center", label: "Herringbone Open Plan",    sub: "Bold geometric pattern · Statement flooring" },
  { url: "/desktop-2.png", pos: "center center", label: "Wide Plank LVT",           sub: "Waterproof · Durable · Underfloor heating compatible" },
  { url: "/desktop-3.png", pos: "center center", label: "Cream Carpet Bedroom",     sub: "Deeply soft · Bedroom perfection · Warm underfoot" },
  { url: "/desktop-4.jpg", pos: "center center", label: "Your New Floor Starts Here", sub: "Free survey · Samples brought to you · No obligation" },
];

// ── Flooring types ───────────────────────────────────────────────
const flooringTypes = [
  {
    name: "Carpet", tag: "Most popular", grade: false,
    desc: "Warm, textured, and making a serious comeback. Available in budget twist to premium wool-blend.",
    img: "/carpet.png",
    subfloorNote: null,
    grades: [],
  },
  {
    name: "LVT", tag: "Best for wet rooms", grade: false,
    desc: "Luxury Vinyl Tile — fully waterproof, incredibly durable, and works in every room including kitchens and bathrooms.",
    img: "/lvt-herringbone-oak.png",
    subfloorNote: "LVT must go down on a perfectly flat surface — it's unforgiving of lumps. Concrete subfloors often need latex levelling compound. Timber subfloors usually need ply boarding. We'll assess and quote for this at survey.",
    grades: [],
  },
  {
    name: "Laminate", tag: "Great value", grade: false,
    desc: "Modern laminate is surprisingly good. Durable, clean lines, and a fraction of the cost of real wood.",
    img: "/laminate-greige-oak.png",
    subfloorNote: "Laminate needs a flat, dry base. Concrete may need latex levelling. Timber boards should be screwed down with no flex or bounce before we start.",
    grades: [],
  },
  {
    name: "Vinyl", tag: "Practical & affordable", grade: false,
    desc: "Sheet vinyl or vinyl planks. Fully waterproof, soft underfoot, very easy to maintain.",
    img: "/quote-vinyl.webp",
    subfloorNote: "Vinyl is thin, which means any bumps or old adhesive residue underneath will show through over time. The subfloor needs to be smooth and clean before we lay it.",
    grades: [],
  },
];

// ── Room average m² for estimate before measurements entered ────
const ROOM_AVG_M2 = {
  "Living Room": 20, "Bedroom": 14, "Hallway": 8, "Stairs": 6,
  "Dining Room": 16, "Landing": 8, "Playroom": 14, "Home Office": 12,
  "Kitchen": 12, "Bathroom": 6, "En-suite": 4, "Conservatory": 14,
  "Garage": 20, "Office Space": 40, "Reception": 30, "Meeting Room": 20,
  "Corridor / Hallway": 15, "Retail Floor": 60, "Warehouse": 100, "Showroom": 50,
  "Gym / Studio": 40, "Restaurant / Café": 40, "Hotel Room": 16, "Staff Room": 14,
};

// ── Extras flat costs for live estimate bar ──────────────────────
const EXTRAS_COSTS = {
  uplift:    { low: 50,  high: 120 },
  ply:       { low: 100, high: 300 },
  latex:     { low: 80,  high: 250 },
  gripper:   { low: 30,  high: 60  },
  doorbar:   { low: 20,  high: 60  },
  furniture: { low: 40,  high: 80  },
  membrane:  { low: 60,  high: 150 },
  acoustic:  { low: 80,  high: 200 },
  skirting:  { low: 60,  high: 180 },
};

// ── Wastage ──────────────────────────────────────────────────────
// Rates are slightly generous — better to over-order than under-order
const WASTAGE = {
  "Carpet":       0.12,  // 12% — straight lay no pattern
  "LVT":          0.12,  // 12% — click system standard
  "LVT Glue Down":0.08,  // 8%  — glue down, more precise cutting
  "Laminate":     0.12,  // 12% — industry standard
  "Vinyl":        0.15,  // 15% — roll goods, cutting waste around obstacles
  "Carpet Tiles": 0.07,  // 7%  — modular, very little waste
};

// ── Live Estimate Pricing ────────────────────────────────────────
const ESTIMATE_PRICES = {
  flooring: {
    "Carpet":       { Budget: { low: 15, high: 19 }, Mid: { low: 28, high: 35 }, Premium: { low: 48, high: 58 }, default: { low: 28, high: 35 } },
    "LVT":          { Budget: { low: 24, high: 30 }, Mid: { low: 36, high: 44 }, Premium: { low: 54, high: 64 }, default: { low: 36, high: 44 } },
    "Laminate":     { Budget: { low: 15, high: 19 }, Mid: { low: 24, high: 30 }, Premium: { low: 32, high: 40 }, default: { low: 24, high: 30 } },
    "Vinyl":        { Budget: { low: 12, high: 16 }, Mid: { low: 20, high: 25 }, Premium: { low: 28, high: 36 }, default: { low: 20, high: 25 } },
  },
  removal: {
    "Carpet":         { low: 3,  high: 6  },
    "Hard floor":     { low: 6,  high: 12 },
    "Tiles":          { low: 10, high: 20 },
    "Vinyl":          { low: 4,  high: 8  },
    "Bare / nothing": null,
  },
  subfloor: {
    "Concrete":        { low: 8,  high: 18 },
    "Timber / boards": { low: 4,  high: 10 },
  },
};

const calculateLiveEstimate = ({ m2, selectedFlooring, flooringGrade, selectedExtras = [] }) => {
  if (!m2 || m2 <= 0) return { low: 0, high: 0, breakdown: [], m2: 0 };

  const flooringGroup = ESTIMATE_PRICES.flooring[selectedFlooring] || { default: { low: 15, high: 50 } };
  const flooringPrice = (flooringGrade && flooringGroup[flooringGrade]) ? flooringGroup[flooringGrade] : flooringGroup.default;

  const flooringLow  = Math.round((flooringPrice.low  * m2) / 10) * 10;
  const flooringHigh = Math.round((flooringPrice.high * m2) / 10) * 10;

  const breakdown = [
    { label: `Flooring supply & fit (${m2.toFixed(1)} m²)`, low: flooringLow, high: flooringHigh },
  ];

  let totalLow  = flooringLow;
  let totalHigh = flooringHigh;

  selectedExtras.forEach(id => {
    const cost = EXTRAS_COSTS[id];
    const ex   = EXTRAS_LIST?.find(e => e.id === id);
    if (cost) {
      totalLow  += cost.low;
      totalHigh += cost.high;
      breakdown.push({ label: ex?.label || id, low: cost.low, high: cost.high });
    }
  });

  totalLow  = Math.round(totalLow  / 10) * 10;
  totalHigh = Math.round(totalHigh / 10) * 10;

  return { low: Math.max(totalLow, 250), high: Math.max(totalHigh, 250), breakdown, m2 };
};

// ── Room SVG icons ───────────────────────────────────────────────
const _HallwaySVG = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="1" width="10" height="14" rx="1"/>
    <circle cx="11" cy="8" r="0.8" fill="currentColor"/>
    <path d="M3 5h10M3 11h10"/>
  </svg>
);
const _BathroomSVG = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10v4a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
    <path d="M3 8V4a1 1 0 012 0v1"/>
    <path d="M1 8h14"/>
  </svg>
);
// ── Illustration SVGs — bird's-eye top-down views (120×80) ──────
// Carpet: side cross-section pile views
const CarpetTwistSVG = () => (
  <svg width="80" height="60" viewBox="0 0 80 60" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect width="80" height="60" fill="#111110" rx="3"/>
    <rect x="2" y="48" width="76" height="10" rx="1" stroke="#c9a96e" strokeWidth="1.3" fill="rgba(201,169,110,0.06)"/>
    {[10,20,30,40,50,60,70].map((x,i) => (
      <g key={i}>
        <path d={`M${x-2},48 C${x-5},36 ${x+3},26 ${x-2},16 C${x-5},8 ${x+1},6 ${x-2},6`} stroke="#c9a96e" strokeWidth="1.3" fill="none"/>
        <path d={`M${x+2},48 C${x+5},36 ${x-3},26 ${x+2},16 C${x+5},8 ${x-1},6 ${x+2},6`} stroke="#c9a96e" strokeWidth="1.3" fill="none"/>
      </g>
    ))}
  </svg>
);
const CarpetBerberSVG = () => (
  <svg width="80" height="60" viewBox="0 0 80 60" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect width="80" height="60" fill="#111110" rx="3"/>
    <rect x="2" y="48" width="76" height="10" rx="1" stroke="#c9a96e" strokeWidth="1.3" fill="rgba(201,169,110,0.06)"/>
    {Array.from({length:7},(_,i) => {
      const x = 5 + i*10;
      return <path key={i} d={`M${x},48 C${x},30 ${x+10},30 ${x+10},48`} stroke="#c9a96e" strokeWidth="1.3" fill="none"/>;
    })}
    {Array.from({length:7},(_,i) => {
      const x = 5 + i*10;
      return <path key={`b${i}`} d={`M${x},32 C${x},18 ${x+10},18 ${x+10},32`} stroke="#c9a96e" strokeWidth="1.3" fill="none" opacity="0.4"/>;
    })}
  </svg>
);
const CarpetSaxonySVG = () => (
  <svg width="80" height="60" viewBox="0 0 80 60" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect width="80" height="60" fill="#111110" rx="3"/>
    <rect x="2" y="48" width="76" height="10" rx="1" stroke="#c9a96e" strokeWidth="1.3" fill="rgba(201,169,110,0.06)"/>
    {[8,17,26,35,44,53,62,71,78].map((x,i) => {
      const tipY = [8,6,10,7,8,6,10,7,8][i];
      return (
        <g key={i}>
          <line x1={x} y1="48" x2={x} y2={tipY} stroke="#c9a96e" strokeWidth="1.3"/>
          <path d={`M${x-2},${tipY+4} Q${x},${tipY} ${x+2},${tipY+4}`} stroke="#c9a96e" strokeWidth="1.3" fill="none"/>
          <line x1={x+1} y1="48" x2={x+1} y2={tipY} stroke="#c9a96e" strokeWidth="1.3" opacity="0.2"/>
        </g>
      );
    })}
  </svg>
);
const CarpetVelvetSVG = () => (
  <svg width="80" height="60" viewBox="0 0 80 60" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect width="80" height="60" fill="#111110" rx="3"/>
    <rect x="2" y="48" width="76" height="10" rx="1" stroke="#c9a96e" strokeWidth="1.3" fill="rgba(201,169,110,0.06)"/>
    {Array.from({length:10},(_,i) => {
      const x = 6 + i*7;
      return <line key={i} x1={x} y1="48" x2={x+13} y2="6" stroke="#c9a96e" strokeWidth="1.3"/>;
    })}
    <line x1="14" y1="12" x2="72" y2="6" stroke="#c9a96e" strokeWidth="1" opacity="0.15"/>
  </svg>
);
const CarpetCutLoopSVG = () => (
  <svg width="80" height="60" viewBox="0 0 80 60" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect width="80" height="60" fill="#111110" rx="3"/>
    <rect x="2" y="48" width="76" height="10" rx="1" stroke="#c9a96e" strokeWidth="1.3" fill="rgba(201,169,110,0.06)"/>
    {[4,22,40,58].map((x,i) => (
      <g key={i}>
        <line x1={x}    y1="48" x2={x}    y2="8"  stroke="#c9a96e" strokeWidth="1.3"/>
        <line x1={x+6}  y1="48" x2={x+6}  y2="8"  stroke="#c9a96e" strokeWidth="1.3"/>
        <path d={`M${x+10},48 C${x+10},34 ${x+18},34 ${x+18},48`} stroke="#c9a96e" strokeWidth="1.3" fill="none"/>
      </g>
    ))}
  </svg>
);
// LVT: top-down plank / tile / herringbone layouts
const LVTPlankSVG = () => (
  <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[[2,2,55],[60,2,58],[2,22,55],[60,22,58],[2,42,55],[60,42,58],[2,62,55],[60,62,56]].map(([x,y,w],i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height="18" rx="0.5" stroke="#c9a96e" strokeWidth="0.8" fill="none"/>
        <line x1={x+12} y1={y} x2={x+11} y2={y+18} stroke="#c9a96e" strokeWidth="0.5" opacity="0.25"/>
        <line x1={x+30} y1={y} x2={x+29} y2={y+18} stroke="#c9a96e" strokeWidth="0.5" opacity="0.18"/>
      </g>
    ))}
  </svg>
);
const LVTHerringboneSVG = () => {
  const pieces = [];
  for (let row=0; row<6; row++) {
    for (let col=0; col<5; col++) {
      const isRight = (row+col)%2===0;
      const cx = col*24 + (isRight ? 0 : 12);
      const cy = row*14;
      const angle = isRight ? 45 : -45;
      pieces.push(<g key={`${row}-${col}`} transform={`rotate(${angle} ${cx+10} ${cy+3.5})`}>
        <rect x={cx} y={cy} width="20" height="7" rx="0.3" stroke="#c9a96e" strokeWidth="0.8" fill="none" opacity="0.8"/>
        <line x1={cx+6} y1={cy} x2={cx+5} y2={cy+7} stroke="#c9a96e" strokeWidth="0.4" opacity="0.3"/>
      </g>);
    }
  }
  return <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">{pieces}</svg>;
};
const LVTTileSVG = () => (
  <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0,1].map(col => [0,1,2].map(row => (
      <g key={`${row}-${col}`}>
        <rect x={col*60+2} y={row*26+2} width="56" height="22" rx="0.5" stroke="#c9a96e" strokeWidth="0.8" fill="none"/>
        <line x1={col*60+14} y1={row*26+2} x2={col*60+40} y2={row*26+24} stroke="#c9a96e" strokeWidth="0.4" opacity="0.18"/>
        <line x1={col*60+40} y1={row*26+2} x2={col*60+14} y2={row*26+24} stroke="#c9a96e" strokeWidth="0.4" opacity="0.12"/>
      </g>
    )))}
  </svg>
);

// Laminate: top-down plank layouts
const LaminateNaturalSVG = () => (
  <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[[1,2,60],[63,2,55],[1,22,45],[48,22,70],[1,42,60],[63,42,55],[1,62,45],[48,62,70]].map(([x,y,w],i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height="18" rx="0.5" stroke="#c9a96e" strokeWidth="0.8" fill="none"/>
        <line x1={x+15} y1={y+3} x2={x+w-8} y2={y+5} stroke="#c9a96e" strokeWidth="0.5" opacity="0.22"/>
        <line x1={x+10} y1={y+10} x2={x+w-5} y2={y+12} stroke="#c9a96e" strokeWidth="0.5" opacity="0.16"/>
      </g>
    ))}
  </svg>
);
const LaminateGreySVG = () => (
  <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[[1,2,60],[63,2,55],[1,22,45],[48,22,70],[1,42,60],[63,42,55],[1,62,45],[48,62,70]].map(([x,y,w],i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height="18" rx="0.5" stroke="#c9a96e" strokeWidth="0.8" fill="none"/>
        <line x1={x+8} y1={y+2} x2={x+w-4} y2={y+16} stroke="#c9a96e" strokeWidth="0.4" opacity="0.2"/>
        <line x1={x+w-8} y1={y+2} x2={x+4} y2={y+16} stroke="#c9a96e" strokeWidth="0.4" opacity="0.14"/>
      </g>
    ))}
  </svg>
);
const LaminateHerringboneSVG = () => {
  const pieces = [];
  for (let row=0; row<5; row++) {
    for (let col=0; col<4; col++) {
      const isRight = (row+col)%2===0;
      const cx = col*28 + (isRight ? 0 : 14);
      const cy = row*17;
      const angle = isRight ? 45 : -45;
      pieces.push(<g key={`${row}-${col}`} transform={`rotate(${angle} ${cx+12} ${cy+4})`}>
        <rect x={cx} y={cy} width="24" height="8" rx="0.3" stroke="#c9a96e" strokeWidth="0.8" fill="none" opacity="0.85"/>
        <line x1={cx+7} y1={cy} x2={cx+6} y2={cy+8} stroke="#c9a96e" strokeWidth="0.4" opacity="0.28"/>
        <line x1={cx+14} y1={cy} x2={cx+13} y2={cy+8} stroke="#c9a96e" strokeWidth="0.4" opacity="0.2"/>
      </g>);
    }
  }
  return <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">{pieces}</svg>;
};

// Vinyl: top-down layouts
const VinylWoodSVG = () => (
  <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[[1,2,72],[75,2,43],[1,16,50],[53,16,65],[1,30,72],[75,30,43],[1,44,50],[53,44,65],[1,58,72],[75,58,43],[1,72,50],[53,72,65]].map(([x,y,w],i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height="12" rx="0.3" stroke="#c9a96e" strokeWidth="0.7" fill="none"/>
        <line x1={x+18} y1={y+1} x2={x+17} y2={y+11} stroke="#c9a96e" strokeWidth="0.4" opacity="0.2"/>
        <line x1={x+40} y1={y+1} x2={x+39} y2={y+11} stroke="#c9a96e" strokeWidth="0.4" opacity="0.15"/>
      </g>
    ))}
  </svg>
);
const VinylStoneSVG = () => (
  <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0,1,2].map(row => [0,1,2].map(col => (
      <g key={`${row}-${col}`}>
        <rect x={col*40+2} y={row*26+2} width="36" height="22" rx="0.5" stroke="#c9a96e" strokeWidth="0.8" fill="none"/>
        <path d={`M${col*40+8} ${row*26+10} Q${col*40+20} ${row*26+6} ${col*40+32} ${row*26+12}`} stroke="#c9a96e" strokeWidth="0.5" fill="none" opacity={col%2===0?"0.22":"0.14"}/>
      </g>
    )))}
  </svg>
);
const VinylPlainSVG = () => (
  <svg width="100%" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[10,30,50,70].map((y,i) => (
      <line key={i} x1="4" y1={y} x2="116" y2={y} stroke="#c9a96e" strokeWidth="0.8" opacity="0.2"/>
    ))}
  </svg>
);

const ROOM_SVG_ICONS = {
  "Living Room": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10V7a1 1 0 011-1h10a1 1 0 011 1v3"/>
      <path d="M1 10h14v2H1z"/>
      <path d="M4 10V8M12 10V8"/>
    </svg>
  ),
  "Bedroom": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="8" rx="1"/>
      <path d="M1 10h14"/>
      <path d="M5 6V4a2 2 0 014 0v2"/>
      <path d="M3 14v1M13 14v1"/>
    </svg>
  ),
  "Hallway": _HallwaySVG,
  "Kitchen": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="1"/>
      <circle cx="5" cy="7" r="1.5"/>
      <circle cx="11" cy="7" r="1.5"/>
      <path d="M1 11h14"/>
    </svg>
  ),
  "Bathroom": _BathroomSVG,
  "Stairs": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14h3v-3h3V8h3V5h3"/>
      <path d="M2 14V5h3"/>
    </svg>
  ),
  "Dining Room": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v12"/>
      <ellipse cx="8" cy="8" rx="6" ry="2"/>
      <path d="M3 6v4M13 6v4"/>
    </svg>
  ),
  "Landing": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h12"/>
      <path d="M2 12V6l4-4h8v10"/>
      <path d="M6 12V8h4v4"/>
    </svg>
  ),
  "Home Office": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="8" rx="1"/>
      <path d="M5 14h6M8 11v3"/>
      <path d="M5 7h6M5 9h4"/>
    </svg>
  ),
  "Playroom": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="11" r="2"/>
      <circle cx="11" cy="11" r="2"/>
      <path d="M7 11h2"/>
      <path d="M8 3v4M5 5l3-2 3 2"/>
    </svg>
  ),
  "En-suite": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h8v3a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"/>
      <path d="M4 9V6a1 1 0 011-1h1"/>
      <path d="M2 9h12"/>
      <circle cx="11" cy="4" r="1.5"/>
    </svg>
  ),
  "Conservatory": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L2 7v7h12V7L8 2z"/>
      <path d="M2 7h12"/>
      <path d="M8 2v5"/>
      <path d="M5 7v7M11 7v7"/>
    </svg>
  ),
  "Garage": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="12" height="10" rx="1"/>
      <path d="M2 8h12"/>
      <path d="M2 11h12"/>
      <path d="M6 4V2h4v2"/>
    </svg>
  ),
  "Office Space": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="14" height="12" rx="1"/>
      <path d="M1 6h14"/>
      <path d="M5 6v8M10 6v8"/>
    </svg>
  ),
  "Reception": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 13h14"/>
      <path d="M3 13V8h10v5"/>
      <path d="M6 8V6a2 2 0 014 0v2"/>
      <circle cx="8" cy="4" r="1.5"/>
    </svg>
  ),
  "Meeting Room": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="8" cy="8" rx="6" ry="3"/>
      <circle cx="4" cy="5" r="1"/>
      <circle cx="8" cy="4" r="1"/>
      <circle cx="12" cy="5" r="1"/>
      <path d="M4 6v4M8 5v6M12 6v4"/>
    </svg>
  ),
  "Corridor / Hallway": _HallwaySVG,
  "Retail Floor": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6h12l-1 7H3L2 6z"/>
      <path d="M1 4h14"/>
      <path d="M6 4L5 1M10 4l1-3"/>
      <path d="M6 10v2M10 10v2"/>
    </svg>
  ),
  "Warehouse": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 14V6l7-4 7 4v8H1z"/>
      <path d="M1 6h14"/>
      <path d="M6 14v-5h4v5"/>
    </svg>
  ),
  "Showroom": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="1"/>
      <path d="M1 8h14"/>
      <path d="M5 3v5M11 3v5"/>
      <circle cx="8" cy="11" r="1"/>
    </svg>
  ),
  "Gym / Studio": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="3" cy="8" r="1.5"/>
      <circle cx="13" cy="8" r="1.5"/>
      <path d="M4.5 8h7"/>
      <rect x="6" y="6" width="4" height="4" rx="0.5"/>
    </svg>
  ),
  "Restaurant / Café": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2v4a2 2 0 01-2 2v6"/>
      <path d="M10 2v12"/>
      <path d="M8 2v3a2 2 0 004 0V2"/>
    </svg>
  ),
  "Hotel Room": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="14" height="8" rx="1"/>
      <path d="M1 10h14"/>
      <path d="M4 6V4a2 2 0 014 0v2"/>
      <path d="M3 14v1M13 14v1"/>
    </svg>
  ),
  "Bathroom / WC": _BathroomSVG,
  "Staff Room": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="4" r="1.5"/>
      <circle cx="11" cy="4" r="1.5"/>
      <path d="M2 14v-3a3 3 0 016 0v3"/>
      <path d="M8 14v-3a3 3 0 016 0v3"/>
    </svg>
  ),
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
const Chip = ({ label, selected, onClick, icon }) => {
  const [pressed, setPressed] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  return (
    <button
      onClick={() => {
        setPressed(true);
        if (!selected) { setJustSelected(true); setTimeout(() => setJustSelected(false), 400); }
        setTimeout(() => { setPressed(false); onClick(); }, 120);
      }}
      style={{
        position: "relative", overflow: "hidden",
        background: pressed ? "rgba(201,169,110,0.08)" : selected ? "rgba(201,169,110,0.15)" : "transparent",
        border: `1px solid ${selected ? "#c9a96e" : "#2a2a28"}`,
        color: selected ? "#c9a96e" : "rgba(242,237,224,0.45)",
        padding: "10px 12px",
        borderRadius: "3px", fontSize: "13px", fontFamily: s.sans,
        cursor: "pointer", textAlign: "left",
        fontWeight: selected ? 600 : 400,
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        display: "flex", alignItems: "center", gap: "8px",
        transform: pressed ? "scale(0.98)" : selected ? "scale(1.02)" : "scale(1)",
        boxShadow: selected ? "0 0 0 1px rgba(201,169,110,0.3)" : "none",
      }}
    >
      {justSelected && (
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.25),transparent)", animation: "shimmerSweep 0.4s ease-out forwards", pointerEvents: "none" }} />
      )}
      {icon && (
        <span style={{ color: s.gold, display: "flex", alignItems: "center", flexShrink: 0 }}>
          {icon}
        </span>
      )}
      {label}
    </button>
  );
};

const RoomChip = ({ label, selected, onClick }) => {
  const [pressed, setPressed] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const icon = ROOM_SVG_ICONS[label];
  return (
    <button
      onClick={() => {
        setPressed(true);
        if (!selected) { setJustSelected(true); setTimeout(() => setJustSelected(false), 400); }
        setTimeout(() => { setPressed(false); onClick(); }, 120);
      }}
      style={{
        position: "relative", overflow: "hidden",
        background: pressed ? "rgba(201,169,110,0.08)" : selected ? "rgba(201,169,110,0.15)" : "transparent",
        border: `1px solid ${selected ? "#c9a96e" : "#2a2a28"}`,
        color: selected ? "#c9a96e" : "rgba(242,237,224,0.45)",
        padding: "10px 12px",
        borderRadius: "3px", fontSize: "12px", fontFamily: s.sans,
        cursor: "pointer", textAlign: "left",
        fontWeight: selected ? 600 : 400,
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        transform: pressed ? "scale(0.98)" : selected ? "scale(1.02)" : "scale(1)",
        boxShadow: selected ? "0 0 0 1px rgba(201,169,110,0.3)" : "none",
        display: "flex", alignItems: "center", gap: "7px",
      }}
    >
      {justSelected && (
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.25),transparent)", animation: "shimmerSweep 0.4s ease-out forwards", pointerEvents: "none" }} />
      )}
      {icon && (
        <span style={{ color: s.gold, display: "flex", alignItems: "center", flexShrink: 0 }}>
          {icon}
        </span>
      )}
      {label}
    </button>
  );
};
const SelectCard = ({ selected, onClick, padding = "12px 14px", children }) => {
  const [pressed, setPressed] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  return (
    <button
      onClick={() => {
        setPressed(true);
        if (!selected) { setJustSelected(true); setTimeout(() => setJustSelected(false), 400); }
        setTimeout(() => { setPressed(false); onClick(); }, 120);
      }}
      style={{
        position: "relative", overflow: "hidden",
        background: pressed ? "rgba(201,169,110,0.08)" : selected ? "rgba(201,169,110,0.15)" : "transparent",
        border: `1px solid ${selected ? "#c9a96e" : "#2a2a28"}`,
        borderRadius: "3px", padding, cursor: "pointer", textAlign: "left", width: "100%",
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        transform: pressed ? "scale(0.98)" : selected ? "scale(1.02)" : "scale(1)",
        boxShadow: selected ? "0 0 0 1px rgba(201,169,110,0.3)" : "none",
      }}
    >
      {justSelected && (
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.25),transparent)", animation: "shimmerSweep 0.4s ease-out forwards", pointerEvents: "none", zIndex: 1 }} />
      )}
      {children}
    </button>
  );
};

const IlCard = ({ selected, onClick, children }) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        setPressed(true);
        if (!selected) { setJustSelected(true); setTimeout(() => setJustSelected(false), 400); }
        setTimeout(() => { setPressed(false); onClick(); }, 120);
      }}
      style={{
        position: "relative", overflow: "hidden",
        background: selected ? "rgba(201,169,110,0.15)" : "transparent",
        border: `1px solid ${selected ? "#c9a96e" : hovered ? "rgba(201,169,110,0.6)" : "#2a2a28"}`,
        borderRadius: "3px", cursor: "pointer", textAlign: "left", width: "100%", padding: 0,
        transition: "all 0.25s ease",
        transform: pressed ? "scale(0.97)" : hovered ? "translateY(-3px) scale(1.03)" : selected ? "scale(1.02)" : "scale(1)",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.5)" : selected ? "0 0 0 1px rgba(201,169,110,0.3)" : "none",
      }}
    >
      {justSelected && (
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(201,169,110,0.25),transparent)", animation: "shimmerSweep 0.4s ease-out forwards", pointerEvents: "none", zIndex: 2 }} />
      )}
      {children}
    </button>
  );
};

const GoldNote = ({ children }) => (
  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 14px", marginBottom: "14px", background: "rgba(201,169,110,0.07)", borderLeft: `2px solid ${s.gold}` }}>
    <span style={{ color: s.gold, fontSize: "7px", marginTop: "4px", flexShrink: 0 }}>◆</span>
    <p style={{ fontFamily: s.sans, fontSize: "11px", lineHeight: 1.7, color: "rgba(242,237,224,0.5)", margin: 0 }}>{children}</p>
  </div>
);

// ── Info Tooltip (alcove / bay window explainer) ─────────────────
function InfoTooltip({ title, children }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const toggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const tooltipW = 270;
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      let left = rect.left;
      if (left + tooltipW > window.innerWidth - 12) {
        left = window.innerWidth - tooltipW - 12;
      }
      if (left < 8) left = 8;

      setCoords({ top: rect.bottom + scrollY + 6, left });
    }
    setOpen(o => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        style={{
          background: "rgba(201,169,110,0.15)",
          border: "1px solid rgba(201,169,110,0.3)",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          minWidth: "20px",
          color: s.gold,
          fontSize: "11px",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: s.sans,
          lineHeight: "20px",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          verticalAlign: "middle",
          marginLeft: "6px",
          flexShrink: 0,
        }}
      >?</button>

      {open && typeof document !== "undefined" && ReactDOM.createPortal(
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.01)" }}
          />
          <div
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              zIndex: 9999,
              background: "#1e1e1c",
              border: `1px solid ${s.border}`,
              borderRadius: "6px",
              padding: "16px 18px",
              width: "270px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ fontFamily: s.serif, fontSize: "16px", fontWeight: 700, color: s.text, marginBottom: "8px" }}>{title}</div>
            <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, lineHeight: 1.7, fontWeight: 300 }}>{children}</div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginTop: "12px", background: "none", border: "none", color: "rgba(242,237,224,0.3)", fontSize: "11px", cursor: "pointer", fontFamily: s.sans, padding: 0, display: "block" }}
            >Close ×</button>
          </div>
        </>,
        document.body
      )}
    </>
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
function MeasureEducationScreen({ onContinue, propertyType }) {
  const isCommercial = propertyType === "Commercial";

  const residentialTips = [
    {
      icon: "📏",
      title: "Skirting board to skirting board — not wall to wall",
      body: "Place your start point at the base of one skirting board and measure to the base of the opposite one. This is the exact footprint your flooring needs to cover. Measuring wall to wall gives you the wrong number because it includes the skirting board thickness.",
    },
    {
      icon: "🛋️",
      title: "Measure under all furniture — not just visible floor",
      body: "Your flooring goes under beds, wardrobes, sofas, dressing tables and all freestanding furniture. Always measure the full room from wall to wall. The only exception is fixed built-in furniture that cannot be moved — measure up to those items but not underneath them.",
    },
    {
      icon: "🚪",
      title: "Measure to the door bar — and note any height differences between rooms",
      body: "Measure to the door bar or threshold at each doorway. Also note whether there is a height difference between rooms — carpet meeting a hard floor, or two hard floors of different thicknesses. This determines which type of door bar is needed. Z bars, T bars and reducers are all different products and the wrong one will not fit.",
    },
    {
      icon: "🪟",
      title: "Bay windows — measure the main room then the bay separately",
      body: "Do not try to measure a bay window room in one go. First measure the main rectangular room as normal. Then measure the bay separately — its width across the opening and how far it projects into the room. We add these together as two rectangles. Never measure diagonally across a bay.",
    },
    {
      icon: "📦",
      title: "Alcoves — width of the opening × depth into the wall",
      body: "An alcove is a recess built into a wall — most commonly found either side of a chimney breast. Measure the width of the opening and how deep it goes back into the wall. These are their own rectangle and get added to your main room total.",
    },
    {
      icon: "🪜",
      title: "Stairs need four measurements — not just a tread count",
      body: "For an accurate stair estimate we need: the number of treads, the tread depth (front to back of each step), the riser height (from one step surface to the next), and the stair width (wall to wall or between spindles). You also need to note any landings and their dimensions. If in doubt our surveyor will confirm everything on site — stairs are the one area where an in-person check makes the biggest difference to accuracy.",
    },
  ];

  const commercialTips = [
    {
      icon: "📐",
      title: "Measure the full floor area — including under desks and counters",
      body: "Measure the entire floor from wall to wall including under desks, behind reception counters and under shelving. Your fitter needs the total floor area to order the right quantity. The only areas to subtract are permanent fixed structures that cannot be moved.",
    },
    {
      icon: "🏗️",
      title: "Note structural columns — their footprint is subtracted from your total",
      body: "Floor to ceiling columns within a room have a footprint that does not get floored. Measure each column's width and depth and note how many there are. We subtract the total column footprint from your floor area automatically.",
    },
    {
      icon: "🚪",
      title: "Commercial doorways — note width and any height differences between areas",
      body: "Commercial spaces often have multiple doorways, double doors and fire door thresholds. The door bar specification depends on the threshold width and any height difference between the two floor surfaces. Note each doorway width and whether the floors either side are at the same level.",
    },
    {
      icon: "📋",
      title: "L-shapes and irregular spaces — measure in rectangular sections",
      body: "Long corridors, L-shaped open plan offices and spaces with structural protrusions are best measured in rectangular sections. Break the space into simple rectangles, measure each one separately and add them together. Do not try to measure an L-shape or U-shape as one measurement.",
    },
    {
      icon: "💧",
      title: "Wet areas must be noted separately — they need different products",
      body: "Commercial kitchens, bathrooms, WC areas and any wet zone need fully waterproof flooring with appropriate slip resistance ratings. These areas cannot use the same product as dry areas. Note them separately with their measurements so we can specify the correct product for each zone.",
    },
    {
      icon: "🏢",
      title: "Raised access flooring and subfloor type affects product selection",
      body: "Many commercial offices have raised access flooring with cable management underneath. Note whether your subfloor is raised access panels, concrete screed or timber. This affects which adhesives and products can be used and what preparation is needed before installation.",
    },
  ];

  const tips = isCommercial ? commercialTips : residentialTips;

  return (
    <div>
      {/* Phone demo / commercial note */}
      {isCommercial ? (
        <div style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "4px", padding: "18px 20px", marginBottom: "16px" }}>
          <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>For commercial spaces</div>
          <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.7, fontWeight: 300 }}>
            A laser distance measure gives the most accurate results in large commercial spaces — more reliable than a phone app over distances above 5 metres. If you have existing floor plans or architectural drawings use those measurements directly. For complex or multi-room commercial fits we strongly recommend booking a free survey visit first.
          </div>
        </div>
      ) : (
        <div style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.18)", borderRadius: "4px", padding: "20px 18px", marginBottom: "16px" }}>
          <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: "14px", textAlign: "center" }}>
            Use your phone&apos;s Measure app
          </div>
          <PhoneMeasureDemo />
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {["iPhone — Measure app (built-in)", "Android — Measure app (built-in)"].map(l => (
              <div key={l} style={{ fontFamily: s.sans, fontSize: "10px", color: "rgba(201,169,110,0.7)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "2px", padding: "4px 10px" }}>{l}</div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ fontFamily: s.sans, fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>
        {isCommercial ? "How to measure commercial spaces" : "How to measure each area"}
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

      <GoldNote>
        {isCommercial
          ? "These figures give us a reliable starting point for your estimate. All commercial installations are confirmed on site by our surveyor before any order is placed or work begins."
          : "Rough figures are completely fine. Our surveyor confirms exact measurements in person before any price is finalised — no obligation at any stage."}
      </GoldNote>
      <GoldBtn onClick={onContinue}>I&apos;m ready to measure →</GoldBtn>
    </div>
  );
}

// ── Room Calculator ──────────────────────────────────────────────
function getRoomGrossM2(room, data, flooringType) {
  const wastage = WASTAGE[flooringType] || 0.12;

  if (room === "Stairs") {
    const treads      = parseInt(data?.treads || 0);
    const treadDepth  = parseFloat(data?.treadDepth  || 220) / 1000;
    const riserHeight = parseFloat(data?.riserHeight || 190) / 1000;
    const treadWidth  = parseFloat(data?.treadWidth  || 860) / 1000;
    const landingM2   = data?.hasLanding
      ? parseFloat(data?.landingL || 0) * parseFloat(data?.landingW || 0)
      : 0;
    const capExtra = data?.fitType === "Cap and band" ? 0.08 : 0;
    const netM2 = (treads * treadDepth * treadWidth) + (treads * riserHeight * treadWidth) + landingM2;
    return netM2 * (1 + wastage + capExtra);
  }

  if (room === "Landing") {
    const main   = parseFloat(data?.l || 0) * parseFloat(data?.w || 0);
    const cutout = data?.hasStairwell
      ? parseFloat(data?.stairwellL || 0) * parseFloat(data?.stairwellW || 0)
      : 0;
    return Math.max(0, main - cutout) * (1 + wastage);
  }

  const main       = parseFloat(data?.l || 0) * parseFloat(data?.w || 0);
  const bay        = data?.hasBay       ? parseFloat(data?.bayL   || 0) * parseFloat(data?.bayD   || 0) : 0;
  const alc        = data?.hasAlc       ? parseFloat(data?.alcW   || 0) * parseFloat(data?.alcD   || 0) : 0;
  const extra1     = data?.hasExtra1    ? parseFloat(data?.extra1L || 0) * parseFloat(data?.extra1W || 0) : 0;
  const extra2     = data?.hasExtra2    ? parseFloat(data?.extra2L || 0) * parseFloat(data?.extra2W || 0) : 0;
  const extra3     = data?.hasExtra3    ? parseFloat(data?.extra3L || 0) * parseFloat(data?.extra3W || 0) : 0;
  const columns    = data?.hasColumns   ? parseInt(data?.numColumns || 0) * parseFloat(data?.colW || 0) * parseFloat(data?.colD || 0) : 0;
  const fixedUnits = data?.hasFixedUnits ? parseFloat(data?.unitW || 0) * parseFloat(data?.unitD || 0) : 0;

  const net = Math.max(0, main + bay + alc + extra1 + extra2 + extra3 - columns - fixedUnits);
  return net * (1 + wastage);
}

function RoomCalculator({ room, data, onChange, flooringType, propertyType }) {
  const isCommercial = propertyType === "Commercial";
  const isStairs     = room === "Stairs";
  const isLanding    = room === "Landing";
  const wastageRate  = WASTAGE[flooringType] || 0.12;
  const wastageLabel = flooringType === "Vinyl" ? "15% wastage"
    : `${Math.round(wastageRate * 100)}% wastage`;
  const grossM2 = getRoomGrossM2(room, data, flooringType);
  const set = (key, val) => onChange({ ...data, [key]: val });

  const inp = {
    background: "transparent", border: "none",
    borderBottom: "1px solid rgba(242,237,224,0.2)",
    color: s.text, fontFamily: s.serif, fontSize: "22px",
    padding: "6px 0", width: "100%", outline: "none",
  };
  const smallInp = { ...inp, fontSize: "18px" };
  const ml = (txt) => (
    <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "6px" }}>{txt}</div>
  );

  const showJoinWarning = !isCommercial && parseFloat(data?.w || 0) > 5.0 &&
    (flooringType === "Carpet" || flooringType === "Vinyl");
  const joinWarningText = flooringType === "Carpet"
    ? "This room is wider than 5 metres. Depending on the roll width selected this may require a heat seam join. Your fitter will position any seam in the least visible location — typically under furniture or in a low traffic area. Roll width availability will be confirmed at survey."
    : "This room is wider than 5 metres. Sheet vinyl comes in 2m, 3m, 4m and 5m widths. A room this wide will likely require heat welded joints — a specialist process that creates a watertight invisible seam. We will confirm roll width options at survey.";

  const showCommercialJoinWarning = isCommercial && parseFloat(data?.w || 0) > 5.0 &&
    (flooringType === "Carpet" || flooringType === "Vinyl");
  const commercialJoinText = flooringType === "Carpet"
    ? "This space exceeds 5 metres width. Broadloom carpet comes in 4m and 5m widths — a heat seam join will likely be required. For large commercial spaces carpet tiles eliminate this issue entirely and allow individual tile replacement if damaged."
    : "This space exceeds 5 metres width. Sheet vinyl will require heat welded joints — a specialist process creating a watertight seam. This is standard practice in commercial installations and when done correctly the joint is virtually invisible.";

  return (
    <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: "4px", marginBottom: "10px", overflow: "hidden" }}>
      {/* Header */}
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

        {/* ── STAIRS ── */}
        {isStairs && (
          <div>
            <GoldNote>Stairs are the hardest area to measure accurately by phone. These figures give us a reliable estimate — our surveyor will confirm exact measurements on site.</GoldNote>

            {ml("Number of treads (count each individual step)")}
            <input style={{ ...inp, fontSize: "28px" }} type="number" placeholder="0" min="0" value={data?.treads || ""} onChange={e => set("treads", e.target.value)} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
              <div>
                {ml("Tread depth (mm)")}
                <input style={smallInp} type="number" placeholder="220" value={data?.treadDepth || ""} onChange={e => set("treadDepth", e.target.value)} />
                <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginTop: "4px" }}>Front to back of each step</div>
              </div>
              <div>
                {ml("Riser height (mm)")}
                <input style={smallInp} type="number" placeholder="190" value={data?.riserHeight || ""} onChange={e => set("riserHeight", e.target.value)} />
                <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginTop: "4px" }}>Step surface to next step</div>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              {ml("Stair width (mm)")}
              <input style={smallInp} type="number" placeholder="860" value={data?.treadWidth || ""} onChange={e => set("treadWidth", e.target.value)} />
              <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginTop: "4px" }}>Wall to wall or between spindles</div>
            </div>

            <div style={{ marginTop: "16px" }}>
              {ml("Fit type")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                {["Waterfall", "Cap and band"].map(type => (
                  <SelectCard key={type} selected={data?.fitType === type} onClick={() => set("fitType", type)} padding="10px 12px">
                    <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: data?.fitType === type ? s.gold : s.text }}>{type}</div>
                    <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim, fontWeight: 300, marginTop: "2px" }}>
                      {type === "Waterfall" ? "Over the nose — uses less carpet" : "Wrapped around each tread — more tailored, uses slightly more"}
                    </div>
                  </SelectCard>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              {ml("Landing")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                {["No landing", "Quarter landing", "Half landing", "Full landing"].map(type => (
                  <Chip key={type} label={type} selected={data?.landingType === type} onClick={() => set("landingType", type)} />
                ))}
              </div>
              {data?.landingType && data?.landingType !== "No landing" && (
                <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)" }}>
                  <GoldNote>Measure the landing from wall to wall. Include the area over the top step nose — measure to the edge of the tread nosing, not to the wall behind it.</GoldNote>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>{ml("Landing length (m)")}<input style={smallInp} type="number" placeholder="0.0" step="0.1" value={data?.landingL || ""} onChange={e => { set("landingL", e.target.value); set("hasLanding", true); }} /></div>
                    <div>{ml("Landing width (m)")}<input style={smallInp} type="number" placeholder="0.0" step="0.1" value={data?.landingW || ""} onChange={e => { set("landingW", e.target.value); set("hasLanding", true); }} /></div>
                  </div>
                </div>
              )}
            </div>

            {data?.treads > 0 && data?.treadDepth && data?.riserHeight && data?.treadWidth && (
              <div style={{ background: "rgba(201,169,110,0.07)", borderRadius: "3px", padding: "10px 14px", marginTop: "12px" }}>
                <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Breakdown</div>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim }}>
                  Treads: {(parseInt(data.treads) * parseFloat(data.treadDepth) / 1000 * parseFloat(data.treadWidth) / 1000).toFixed(2)} m²
                </div>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim }}>
                  Risers: {(parseInt(data.treads) * parseFloat(data.riserHeight) / 1000 * parseFloat(data.treadWidth) / 1000).toFixed(2)} m²
                </div>
                {data?.hasLanding && data?.landingL && data?.landingW && (
                  <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim }}>
                    Landing: {(parseFloat(data.landingL) * parseFloat(data.landingW)).toFixed(2)} m²
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LANDING (separate room) ── */}
        {isLanding && !isStairs && (
          <div>
            <GoldNote>Measure the landing from wall to wall. The measurement should extend over the nose of the top step — measure to the edge of the tread nosing, not back to the wall. For quarter and half landings measure each rectangular section separately.</GoldNote>
            {ml("Main room")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>{ml("Length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.l || ""} onChange={e => set("l", e.target.value)} /></div>
              <div>{ml("Width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.w || ""} onChange={e => set("w", e.target.value)} /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasStairwell ? "10px" : "0" }}>
              <button onClick={() => set("hasStairwell", !data?.hasStairwell)} style={{ background: data?.hasStairwell ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasStairwell ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasStairwell ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasStairwell ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasStairwell ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasStairwell ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasStairwell ? "✓ " : "+ "}Stairwell opening (open landings)
              </button>
            </div>
            {data?.hasStairwell && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginBottom: "10px" }}>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "8px" }}>The open section over the stairwell — this area has no floor and is subtracted from your total.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>{ml("Opening length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.stairwellL || ""} onChange={e => set("stairwellL", e.target.value)} /></div>
                  <div>{ml("Opening width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.stairwellW || ""} onChange={e => set("stairwellW", e.target.value)} /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESIDENTIAL STANDARD ROOMS ── */}
        {!isStairs && !isLanding && !isCommercial && (
          <>
            <GoldNote>Measure the full room from wall to wall — including under beds, wardrobes, sofas and dressing tables. Flooring goes under all freestanding furniture. Only subtract fixed built-in furniture that cannot be moved.</GoldNote>
            {ml("Main room")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "4px" }}>
              <div>{ml("Length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.l || ""} onChange={e => set("l", e.target.value)} /></div>
              <div>{ml("Width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.w || ""} onChange={e => set("w", e.target.value)} /></div>
            </div>
            {parseFloat(data?.l || 0) > 0 && parseFloat(data?.w || 0) > 0 && (
              <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginBottom: "12px" }}>
                {parseFloat(data.l).toFixed(1)} × {parseFloat(data.w).toFixed(1)} = {(parseFloat(data.l) * parseFloat(data.w)).toFixed(2)} m²
              </div>
            )}
            {showJoinWarning && <GoldNote>{joinWarningText}</GoldNote>}

            {/* Bay window */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasBay ? "10px" : "6px" }}>
              <button onClick={() => set("hasBay", !data?.hasBay)} style={{ background: data?.hasBay ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasBay ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasBay ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasBay ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasBay ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasBay ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasBay ? "✓ " : "+ "}Bay window
              </button>
              <InfoTooltip title="What is a bay window?">
                A bay window projects outward from the main wall creating a recess. Measure the main room first then measure the bay separately — its width × how far it projects into the room. Add them as two rectangles.
              </InfoTooltip>
            </div>
            {data?.hasBay && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginBottom: "10px" }}>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "8px" }}>Bay width × how far it projects into the room. Do not measure diagonally.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>{ml("Bay width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.bayL || ""} onChange={e => set("bayL", e.target.value)} /></div>
                  <div>{ml("Projection (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.bayD || ""} onChange={e => set("bayD", e.target.value)} /></div>
                </div>
              </div>
            )}

            {/* Alcove */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasAlc ? "10px" : "0" }}>
              <button onClick={() => set("hasAlc", !data?.hasAlc)} style={{ background: data?.hasAlc ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasAlc ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasAlc ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasAlc ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasAlc ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasAlc ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasAlc ? "✓ " : "+ "}Alcove
              </button>
              <InfoTooltip title="What is an alcove?">
                A recess built into a wall — most commonly either side of a chimney breast. Measure the width of the opening and how deep it goes back into the wall.
              </InfoTooltip>
            </div>
            {data?.hasAlc && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)" }}>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "8px" }}>Width of the alcove opening × how deep it goes into the wall.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>{ml("Alcove width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.alcW || ""} onChange={e => set("alcW", e.target.value)} /></div>
                  <div>{ml("Alcove depth (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.alcD || ""} onChange={e => set("alcD", e.target.value)} /></div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── COMMERCIAL STANDARD ROOMS ── */}
        {!isStairs && isCommercial && (
          <>
            <GoldNote>Rough figures are fine at this stage. Our surveyor will visit and confirm all measurements before any order is placed.</GoldNote>
            {ml("Main area")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "4px" }}>
              <div>{ml("Length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.l || ""} onChange={e => set("l", e.target.value)} /></div>
              <div>{ml("Width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.w || ""} onChange={e => set("w", e.target.value)} /></div>
            </div>
            {parseFloat(data?.l || 0) > 0 && parseFloat(data?.w || 0) > 0 && (
              <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginBottom: "12px" }}>
                {parseFloat(data.l).toFixed(1)} × {parseFloat(data.w).toFixed(1)} = {(parseFloat(data.l) * parseFloat(data.w)).toFixed(2)} m²
              </div>
            )}
            {showCommercialJoinWarning && <GoldNote>{commercialJoinText}</GoldNote>}

            {/* Additional sections (L-shapes, corridors) */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasExtra1 ? "10px" : "6px" }}>
              <button onClick={() => set("hasExtra1", !data?.hasExtra1)} style={{ background: data?.hasExtra1 ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasExtra1 ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasExtra1 ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasExtra1 ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasExtra1 ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasExtra1 ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasExtra1 ? "✓ " : "+ "}Add another section (L-shapes, corridors)
              </button>
            </div>
            {data?.hasExtra1 && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginBottom: "10px" }}>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "8px" }}>For L-shaped spaces measure each rectangular section separately and add them together.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                  <div>{ml("Section 2 length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.extra1L || ""} onChange={e => set("extra1L", e.target.value)} /></div>
                  <div>{ml("Section 2 width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.extra1W || ""} onChange={e => set("extra1W", e.target.value)} /></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasExtra2 ? "10px" : "0" }}>
                  <button onClick={() => set("hasExtra2", !data?.hasExtra2)} style={{ background: data?.hasExtra2 ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasExtra2 ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasExtra2 ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasExtra2 ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasExtra2 ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasExtra2 ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                    {data?.hasExtra2 ? "✓ " : "+ "}Add section 3
                  </button>
                </div>
                {data?.hasExtra2 && (
                  <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginBottom: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                      <div>{ml("Section 3 length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.extra2L || ""} onChange={e => set("extra2L", e.target.value)} /></div>
                      <div>{ml("Section 3 width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.extra2W || ""} onChange={e => set("extra2W", e.target.value)} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => set("hasExtra3", !data?.hasExtra3)} style={{ background: data?.hasExtra3 ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasExtra3 ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasExtra3 ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasExtra3 ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasExtra3 ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasExtra3 ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                        {data?.hasExtra3 ? "✓ " : "+ "}Add section 4
                      </button>
                    </div>
                    {data?.hasExtra3 && (
                      <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginTop: "10px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>{ml("Section 4 length (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.extra3L || ""} onChange={e => set("extra3L", e.target.value)} /></div>
                          <div>{ml("Section 4 width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.extra3W || ""} onChange={e => set("extra3W", e.target.value)} /></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Structural columns */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasColumns ? "10px" : "6px", marginTop: "6px" }}>
              <button onClick={() => set("hasColumns", !data?.hasColumns)} style={{ background: data?.hasColumns ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasColumns ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasColumns ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasColumns ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasColumns ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasColumns ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasColumns ? "✓ " : "+ "}Structural columns
              </button>
              <InfoTooltip title="Structural columns">
                Floor to ceiling columns within the room. Flooring fits around them and their footprint is subtracted from your total floor area.
              </InfoTooltip>
            </div>
            {data?.hasColumns && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginBottom: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>{ml("Number of columns")}<input style={smallInp} type="number" placeholder="0" min="0" value={data?.numColumns || ""} onChange={e => set("numColumns", e.target.value)} /></div>
                  <div>{ml("Column width (m)")}<input style={smallInp} type="number" placeholder="0.0" step="0.05" value={data?.colW || ""} onChange={e => set("colW", e.target.value)} /></div>
                  <div>{ml("Column depth (m)")}<input style={smallInp} type="number" placeholder="0.0" step="0.05" value={data?.colD || ""} onChange={e => set("colD", e.target.value)} /></div>
                </div>
                {data?.numColumns && data?.colW && data?.colD && (
                  <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", fontFamily: s.sans, marginTop: "6px" }}>
                    Subtracting: {(parseInt(data.numColumns) * parseFloat(data.colW) * parseFloat(data.colD)).toFixed(2)} m²
                  </div>
                )}
              </div>
            )}

            {/* Fixed counters / built-in units */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasFixedUnits ? "10px" : "6px" }}>
              <button onClick={() => set("hasFixedUnits", !data?.hasFixedUnits)} style={{ background: data?.hasFixedUnits ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasFixedUnits ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasFixedUnits ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasFixedUnits ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasFixedUnits ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasFixedUnits ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasFixedUnits ? "✓ " : "+ "}Fixed counters or built-in units
              </button>
              <InfoTooltip title="Fixed counters and built-in units">
                Permanently fixed items that cannot be moved before fitting — reception desks, fixed shelving, bar counters, kitchen islands. Measure their footprint (width × depth from wall). Their area is subtracted from your total.
              </InfoTooltip>
            </div>
            {data?.hasFixedUnits && (
              <div style={{ paddingLeft: "12px", borderLeft: "1px solid rgba(201,169,110,0.2)", marginBottom: "10px" }}>
                <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginBottom: "8px" }}>Total footprint of all fixed units combined.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>{ml("Total width (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.unitW || ""} onChange={e => set("unitW", e.target.value)} /></div>
                  <div>{ml("Total depth (m)")}<input style={inp} type="number" placeholder="0.0" step="0.1" value={data?.unitD || ""} onChange={e => set("unitD", e.target.value)} /></div>
                </div>
              </div>
            )}

            {/* Raised access floor */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasRaisedAccess ? "4px" : "6px" }}>
              <button onClick={() => set("hasRaisedAccess", !data?.hasRaisedAccess)} style={{ background: data?.hasRaisedAccess ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasRaisedAccess ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasRaisedAccess ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasRaisedAccess ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasRaisedAccess ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasRaisedAccess ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasRaisedAccess ? "✓ " : "+ "}Raised access flooring
              </button>
            </div>
            {data?.hasRaisedAccess && (
              <GoldNote>Raised access flooring affects which products can be used and how they are fixed. Some adhesive products cannot be applied to raised access panels. We will specify the correct product at survey.</GoldNote>
            )}

            {/* Wet zone */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: data?.hasWetZone ? "4px" : "6px" }}>
              <button onClick={() => set("hasWetZone", !data?.hasWetZone)} style={{ background: data?.hasWetZone ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${data?.hasWetZone ? s.gold : s.border}`, borderRadius: "3px", color: data?.hasWetZone ? s.gold : "rgba(242,237,224,0.45)", fontFamily: s.sans, fontSize: "11px", fontWeight: data?.hasWetZone ? 600 : 400, padding: "7px 12px", cursor: "pointer", flex: 1, textAlign: "left", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", transform: data?.hasWetZone ? "scale(1.02)" : "scale(1)", boxShadow: data?.hasWetZone ? "0 0 0 1px rgba(201,169,110,0.3)" : "none" }}>
                {data?.hasWetZone ? "✓ " : "+ "}This area includes a wet zone
              </button>
            </div>
            {data?.hasWetZone && (
              <GoldNote>Wet areas require fully waterproof flooring with appropriate slip ratings. Commercial kitchens need R11 anti-slip rated flooring as a minimum. We will specify the correct product for this zone at survey.</GoldNote>
            )}

            {room === "Restaurant / Café" && (
              <GoldNote>Restaurant and kitchen areas have specific requirements. Kitchen zones need R11 anti-slip rated safety flooring as a minimum. Front of house can use standard commercial flooring. Flag kitchen and front of house areas separately if they need different products.</GoldNote>
            )}
            {room === "Warehouse" && (
              <GoldNote>Warehouse floors often need specialist resin, epoxy or heavy duty safety vinyl. Note any areas with forklift traffic, chemical exposure or heavy racking — these require specific product specifications and may need additional subfloor preparation.</GoldNote>
            )}
            {room === "Gym / Studio" && (
              <GoldNote>Gym and studio floors need specific products — rubber flooring, sports vinyl or specialist acoustic underlay. Note the activity type (weights, cardio, dance, yoga) as this determines the product specification.</GoldNote>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ── Mini quote visualisers ───────────────────────────────────────
const VISUALISER_RESIDENTIAL_ROOMS = [
  { name: "Living Room", points: "40,56 108,46 138,100 70,110" },
  { name: "Kitchen",     points: "98,28 166,18 176,36 108,46" },
  { name: "Hallway",     points: "108,46 142,41 172,95 138,100" },
  { name: "Bedroom",     points: "142,41 210,31 240,85 172,95" },
  { name: "Bathroom",    points: "166,18 200,13 210,31 176,36" },
];
const RESIDENTIAL_OUTER_SHELL = "98,28 200,13 240,85 70,110 40,56 108,46";
const RESIDENTIAL_DEPTH_OFFSET = 10;
const VISUALISER_COMMERCIAL_ROOMS = [
  { name: "Reception",             points: "52,36 108,58 58,84 4,60" },
  { name: "Office Space",           points: "108,58 214,102 128,146 58,84" },
  { name: "Meeting Room",           points: "148,28 220,58 174,82 108,58" },
  { name: "Corridor / Hallway",     points: "58,84 128,146 94,164 26,100" },
  { name: "Bathroom / WC",          points: "174,82 220,58 238,88 214,102" },
];
const VISUALISER_ROOM_ALIASES = {
  "Bedroom 1": "Bedroom",
  "Bedroom 2": "Bedroom",
  "Bedroom 3": "Bedroom",
  "Bedroom 4": "Bedroom",
  "Bedroom 5": "Bedroom",
  "Bedroom 6": "Bedroom",
  "Bedroom 7": "Bedroom",
  "Bedroom 8": "Bedroom",
  "Dining Room": "Living Room",
  "Landing": "Hallway",
  "Stairs": "Hallway",
  "En-suite": "Bathroom",
  "Conservatory": "Living Room",
  "Garage": "Kitchen",
  "Retail Floor": "Office Space",
  "Showroom": "Office Space",
  "Gym / Studio": "Office Space",
  "Warehouse": "Office Space",
  "Restaurant / Café": "Office Space",
  "Hotel Room": "Meeting Room",
  "Staff Room": "Bathroom / WC",
};
const FLOORING_TEXTURE_IDS = {
  "Carpet": "texture-carpet",
  "LVT": "texture-lvt",
  "SPC": "texture-lvt",
  "Laminate": "texture-laminate",
  "Vinyl": "texture-vinyl",
  "Carpet Tiles": "texture-carpet-tiles",
  "Commercial carpet tiles": "texture-carpet-tiles",
  "Commercial Carpet Tiles": "texture-carpet-tiles",
  "Safety Vinyl": "texture-safety-vinyl",
  "Safety vinyl": "texture-safety-vinyl",
  "Rubber": "texture-rubber",
};

const baseRoomName = (room) => room?.replace(/\s+\d+$/, "") || "";
const visualiserRoomKey = (room) => VISUALISER_ROOM_ALIASES[room] || VISUALISER_ROOM_ALIASES[baseRoomName(room)] || baseRoomName(room);
const roomIsSelected = (room, selectedRooms) => selectedRooms.some(selected => visualiserRoomKey(selected) === room);
const getRoomFlooring = (room, selectedRooms, roomConfigs, selectedFlooring) => {
  const configuredRoom = selectedRooms.find(selected => visualiserRoomKey(selected) === room && roomConfigs?.[selected]?.flooring);
  return roomConfigs?.[configuredRoom]?.flooring || selectedFlooring || "";
};
const textureForFlooring = (flooring) => FLOORING_TEXTURE_IDS[flooring] || "";

function FlooringTexturePatterns() {
  return (
    <defs>
      <pattern id="texture-carpet" x="0" y="0" width="9" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 4 Q2 1.5 4 4 T8 4" fill="none" stroke="rgba(242,237,224,0.32)" strokeWidth="0.7"/>
      </pattern>
      <pattern id="texture-lvt" x="0" y="0" width="14" height="7" patternUnits="userSpaceOnUse">
        <path d="M0 2.5h14M0 6.5h14" stroke="rgba(242,237,224,0.28)" strokeWidth="0.6"/>
      </pattern>
      <pattern id="texture-laminate" x="0" y="0" width="22" height="8" patternUnits="userSpaceOnUse">
        <path d="M0 4h22M11 0v8" stroke="rgba(242,237,224,0.26)" strokeWidth="0.65"/>
      </pattern>
      <pattern id="texture-herringbone" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
        <path d="M0 4 6 0 12 4M0 8 6 4 12 8" fill="none" stroke="rgba(242,237,224,0.3)" strokeWidth="0.65"/>
      </pattern>
      <pattern id="texture-vinyl" x="0" y="0" width="16" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 0h16v12H0zM8 0v12M0 6h16" fill="none" stroke="rgba(242,237,224,0.2)" strokeWidth="0.55"/>
      </pattern>
      <pattern id="texture-carpet-tiles" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 0h12v12H0zM6 0v12M0 6h12" fill="none" stroke="rgba(242,237,224,0.3)" strokeWidth="0.65"/>
      </pattern>
      <pattern id="texture-safety-vinyl" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.7" fill="rgba(242,237,224,0.28)"/>
        <circle cx="6" cy="6" r="0.7" fill="rgba(242,237,224,0.22)"/>
      </pattern>
      <pattern id="texture-rubber" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="3" r="0.65" fill="rgba(242,237,224,0.24)"/>
        <circle cx="7" cy="2" r="0.5" fill="rgba(242,237,224,0.2)"/>
        <circle cx="6" cy="8" r="0.7" fill="rgba(242,237,224,0.18)"/>
      </pattern>
    </defs>
  );
}

function MiniVisualiserShell({ rooms, selectedRooms, roomConfigs, selectedFlooring }) {
  return (
    <div className="quote-mini-visualiser" style={{ background: "#111110", border: "1px solid rgba(201,169,110,0.22)", borderRadius: "4px", padding: "10px 10px 8px", marginBottom: "8px" }}>
      <svg width="244" height="170" viewBox="0 0 244 170" style={{ width: "100%", height: "auto", maxHeight: "150px", display: "block" }} aria-hidden="true">
        <FlooringTexturePatterns />
        {rooms.map(({ name, points }) => {
          const selected = roomIsSelected(name, selectedRooms);
          const flooring = getRoomFlooring(name, selectedRooms, roomConfigs, selectedFlooring);
          const texture = selected && flooring ? textureForFlooring(flooring) : "";
          return (
            <g key={name}>
              <polygon
                points={points}
                fill={selected ? "rgba(201,169,110,0.15)" : "transparent"}
                stroke={selected ? "#e5c47d" : "#c9a96e"}
                strokeWidth={selected ? "1.7" : "1.15"}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {texture && (
                <polygon points={points} fill={`url(#${texture})`} opacity="0.75" style={{ pointerEvents: "none" }} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ResidentialMiniVisualiser({ selectedRooms, roomConfigs, selectedFlooring, showTextures = true }) {
  const wallStroke = "#c9a96e";
  const brightStroke = "#e5c47d";
  const depth = RESIDENTIAL_DEPTH_OFFSET;
  const depthWall = (points) => points.map(([x, y]) => `${x},${y}`).join(" ");
  const outerDepthFront = depthWall([[40,56], [70,110], [240,85], [240,85 + depth], [70,110 + depth], [40,56 + depth]]);
  const outerDepthRight = depthWall([[200,13], [240,85], [240,85 + depth], [200,13 + depth]]);
  const drawWall = (key, x1, y1, x2, y2, width = 2) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={wallStroke} strokeWidth={width} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
  );
  const roomState = (name) => {
    const selected = roomIsSelected(name, selectedRooms);
    const flooring = getRoomFlooring(name, selectedRooms, roomConfigs, selectedFlooring);
    return { selected, flooring, texture: selected && showTextures && flooring ? textureForFlooring(flooring) : "" };
  };

  return (
    <div className="quote-mini-visualiser quote-mini-visualiser-residential" style={{ background: "#111110", border: "1px solid rgba(201,169,110,0.22)", borderRadius: "4px", padding: "10px 10px 8px", marginBottom: "8px" }}>
      <svg width="244" height="170" viewBox="0 0 244 170" style={{ width: "100%", height: "auto", maxHeight: "180px", display: "block" }} aria-hidden="true">
        <FlooringTexturePatterns />
        <defs>
          <filter id="residential-selected-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.6" />
          </filter>
        </defs>

        <polygon points={outerDepthFront} fill="rgba(201,169,110,0.035)" stroke="rgba(201,169,110,0.16)" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polygon points={outerDepthRight} fill="rgba(201,169,110,0.055)" stroke="rgba(201,169,110,0.18)" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {VISUALISER_RESIDENTIAL_ROOMS.map(({ name, points }) => {
          const { selected } = roomState(name);
          return selected ? (
            <polygon key={`${name}-glow`} points={points} fill="rgba(201,169,110,0.18)" opacity="0.55" filter="url(#residential-selected-glow)" />
          ) : null;
        })}

        {VISUALISER_RESIDENTIAL_ROOMS.map(({ name, points }) => {
          const { selected, texture } = roomState(name);
          return (
            <g key={name}>
              <polygon
                points={points}
                fill={selected ? "rgba(201,169,110,0.12)" : "rgba(17,17,16,0.72)"}
                stroke={selected ? brightStroke : "rgba(201,169,110,0.58)"}
                strokeWidth={selected ? "1.2" : "0.75"}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {texture && <polygon points={points} fill={`url(#${texture})`} opacity="0.62" style={{ pointerEvents: "none" }} />}
            </g>
          );
        })}

        <polygon points={RESIDENTIAL_OUTER_SHELL} fill="none" stroke={wallStroke} strokeWidth="2.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {[
          drawWall("living-hall-a", 108,46, 118,64),
          drawWall("living-hall-b", 128,82, 138,100),
          drawWall("hall-bedroom-a", 142,41, 151,58),
          drawWall("hall-bedroom-b", 163,76, 172,95),
          drawWall("kitchen-hall-a", 108,46, 132,42.5),
          drawWall("kitchen-hall-b", 151,39.5, 176,36),
          drawWall("kitchen-bath-a", 166,18, 170,25),
          drawWall("kitchen-bath-b", 173,31, 176,36),
          drawWall("bath-bedroom-a", 176,36, 188,34),
          drawWall("bath-bedroom-b", 198,33, 210,31),
        ]}

        <path d="M119 66 q7 5 9 14" fill="none" stroke="rgba(201,169,110,0.5)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d="M153 60 q8 3 10 14" fill="none" stroke="rgba(201,169,110,0.45)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d="M133 43 q8 6 16 4" fill="none" stroke="rgba(201,169,110,0.42)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <path d="M188 34 q6 4 10 -1" fill="none" stroke="rgba(201,169,110,0.42)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />

        <path d="M70 110v10M240 85v10M40 56v10M200 13v10" stroke="rgba(201,169,110,0.16)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function CommercialMiniVisualiser(props) {
  return <MiniVisualiserShell rooms={VISUALISER_COMMERCIAL_ROOMS} {...props} />;
}

function VisualiserRoomLabelRow({ selectedRooms, roomConfigs, selectedFlooring }) {
  if (!selectedRooms.length) return null;
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
      {selectedRooms.map(room => {
        const flooring = roomConfigs?.[room]?.flooring || selectedFlooring;
        return (
          <div key={room} style={{ border: "1px solid rgba(201,169,110,0.22)", borderRadius: "3px", padding: "5px 7px", minWidth: 0, background: "rgba(17,17,16,0.85)" }}>
            <div style={{ fontFamily: s.sans, fontSize: "9px", color: "#f2ede0", lineHeight: 1.2, whiteSpace: "nowrap" }}>{room}</div>
            {flooring && <div style={{ fontFamily: s.sans, fontSize: "8px", color: "#c9a96e", lineHeight: 1.35, marginTop: "2px", whiteSpace: "nowrap" }}>{flooring}</div>}
          </div>
        );
      })}
    </div>
  );
}

function FloNudge({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: s.serif, fontStyle: "italic", fontSize: 11, fontWeight: 700, color: "#111110" }}>F</span>
      </div>
      <div style={{ fontFamily: s.serif, fontSize: "13px", fontStyle: "italic", color: s.gold, lineHeight: 1.45 }}>{message}</div>
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

// ── Intersection observer hook ───────────────────────────────────
function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Animated step card ───────────────────────────────────────────
function StepCard({ num, title, body, delay = 0 }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className="step-card" style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.55s ${delay}ms, transform 0.55s ${delay}ms` }}>
      <div style={{ fontFamily: s.serif, fontSize: "52px", fontWeight: 700, color: "rgba(201,169,110,0.08)", position: "absolute", top: "-4px", left: "8px", lineHeight: 1, userSelect: "none" }}>{num}</div>
      <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "5px" }}>Step {num}</div>
      <div style={{ fontFamily: s.serif, fontSize: "18px", fontWeight: 700, color: s.text, marginBottom: "6px" }}>{title}</div>
      <div style={{ fontSize: "12px", color: s.dim, lineHeight: 1.6, fontWeight: 300, fontFamily: s.sans }}>{body}</div>
    </div>
  );
}

// ── Animated stat box ────────────────────────────────────────────
function StatBox({ value, label }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} className="stat-box" style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s, transform 0.5s" }}>
      <div style={{ fontFamily: s.serif, fontSize: "32px", fontWeight: 700, color: s.gold, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, marginTop: "4px" }}>{label}</div>
    </div>
  );
}

// ── Animated checkmark ───────────────────────────────────────────
function AnimatedCheck() {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 200); return () => clearTimeout(t); }, []);
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ display: "block", margin: "0 auto 16px" }}>
      <circle cx="27" cy="27" r="26" stroke={s.gold} strokeWidth="1.5"
        strokeDasharray="163.4" strokeDashoffset={drawn ? 0 : 163.4}
        style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)", transitionDelay: "0.1s" }} />
      <polyline points="16,27 24,35 38,19" stroke={s.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        strokeDasharray="40" strokeDashoffset={drawn ? 0 : 40}
        style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)", transitionDelay: "0.6s" }} />
    </svg>
  );
}

// ── Typewriter for reference number ─────────────────────────────
function Typewriter({ text, delay = 400 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 60);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <span>{displayed}</span>;
}

// ════════════════════════════════════════════════════════════════
export default function StrataPage() {
  const [activeGallery,    setActiveGallery]    = useState(0);
  const [isMobile,         setIsMobile]         = useState(null);
  const [scrollY,          setScrollY]          = useState(0);
  const [step,             setStep]             = useState(0);
  const [measureSubStep,   setMeasureSubStep]   = useState("educate");
  const [propertyType,     setPropertyType]     = useState("");
  const [selectedRooms,    setSelectedRooms]    = useState([]);
  const [bedroomCount,     setBedroomCount]     = useState(1);
  const [dimensions,       setDimensions]       = useState({});
  const [selectedFlooring,   setSelectedFlooring]   = useState("");
  const [flooringGrade,      setFlooringGrade]      = useState("");
  const [selectedPileStyle,  setSelectedPileStyle]  = useState("");
  const [selectedVinylStyle, setSelectedVinylStyle] = useState("");
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

  // ── Live estimate state
  const [liveEstimate,    setLiveEstimate]    = useState({ low: 0, high: 0, breakdown: [], m2: 0 });
  const [estimateExpanded, setEstimateExpanded] = useState(false);
  const [isCalculating,   setIsCalculating]   = useState(false);

  // ── Phone intercept modal
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // ── localStorage welcome-back
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // ── Flo intercept state (Step 2 / know sub-step timer)
  const [showFloIntercept,  setShowFloIntercept]  = useState(false);
  const [interceptOpen,     setInterceptOpen]     = useState(false);
  const [interceptInput,    setInterceptInput]    = useState("");
  const [interceptResponse, setInterceptResponse] = useState(null);
  const [interceptLoading,  setInterceptLoading]  = useState(false);
  const floInterceptTimer = useRef(null);

  const expandedRooms = selectedRooms.flatMap(r =>
    r === "Bedroom" ? Array.from({ length: bedroomCount }, (_, i) => bedroomCount === 1 ? "Bedroom" : `Bedroom ${i + 1}`) : [r]
  );
  const totalGrossM2 = expandedRooms.reduce((acc, r) => {
    const roomFlooring = roomConfigs[r]?.flooring || selectedFlooring;
    return acc + getRoomGrossM2(r, dimensions[r], roomFlooring);
  }, 0);
  const uniqueFloorings = [...new Set(expandedRooms.map(r => roomConfigs[r]?.flooring || selectedFlooring).filter(Boolean))];
  const flooringDisplay = uniqueFloorings.length > 1 ? "Multiple" : (uniqueFloorings[0] || selectedFlooring || "");
  const quoteData = {
    rooms: expandedRooms, propertyType,
    flooringType: flooringDisplay, flooringGrade,
    currentFloor, subfloorType: subfloor,
    extras: selectedExtras, budget, timing, serviceType,
    totalGrossM2: totalGrossM2.toFixed(2),
    roomConfigs,
    roomFlooringBreakdown: Object.fromEntries(expandedRooms.map(r => [r, roomConfigs[r]?.flooring || selectedFlooring])),
  };

  const allMeasurementsValid = expandedRooms.length > 0 && expandedRooms.every(r => {
    const d = dimensions[r] || {};
    if (r === "Stairs") return parseInt(d.treads || 0) > 0;
    return parseFloat(d.l || 0) > 0 && parseFloat(d.w || 0) > 0;
  });

  useEffect(() => {
    if (!selectedRooms.length || !allMeasurementsValid || totalGrossM2 <= 0) {
      setLiveEstimate({ low: 0, high: 0, breakdown: [], m2: 0 });
      return;
    }
    const est = calculateLiveEstimate({ m2: totalGrossM2, selectedFlooring, flooringGrade, selectedExtras });
    setLiveEstimate(est);
  }, [selectedFlooring, flooringGrade, totalGrossM2, selectedRooms, selectedExtras, allMeasurementsValid]);

  useEffect(() => {
    if (!selectedRooms.length) return;
    setIsCalculating(true);
    const t = setTimeout(() => setIsCalculating(false), 350);
    return () => clearTimeout(t);
  }, [selectedFlooring, flooringGrade, totalGrossM2, selectedRooms.length, selectedExtras.length]);

  // ── Flo intercept timer (8 seconds on Step 2 / know sub-step, only if no flooring selected)
  useEffect(() => {
    if (step === 2 && step2Sub === "know" && !selectedFlooring) {
      floInterceptTimer.current = setTimeout(() => setShowFloIntercept(true), 8000);
    } else {
      clearTimeout(floInterceptTimer.current);
      setShowFloIntercept(false);
      setInterceptInput("");
      setInterceptResponse(null);
      setInterceptOpen(false);
    }
    return () => clearTimeout(floInterceptTimer.current);
  }, [step, step2Sub, selectedFlooring]);

  // ── localStorage restore (mount only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("strata_quote_v1");
      if (!raw) return;
      const { data, savedAt } = JSON.parse(raw);
      if (!data || data.step === 0) return;
      if (Date.now() - savedAt > 7 * 24 * 60 * 60 * 1000) { localStorage.removeItem("strata_quote_v1"); return; }
      setStep(data.step);
      setMeasureSubStep(data.measureSubStep || "educate");
      setStep2Sub(data.step2Sub || "path");
      setPropertyType(data.propertyType || "");
      setSelectedRooms(data.selectedRooms || []);
      setBedroomCount(data.bedroomCount || 1);
      setDimensions(data.dimensions || {});
      setSelectedFlooring(data.selectedFlooring || "");
      setFlooringGrade(data.flooringGrade || "");
      setSelectedPileStyle(data.selectedPileStyle || "");
      setSelectedVinylStyle(data.selectedVinylStyle || "");
      setCurrentFloor(data.currentFloor || "");
      setSubfloor(data.subfloor || "");
      setSelectedExtras(data.selectedExtras || []);
      setBudget(data.budget || "");
      setTiming(data.timing || "");
      setServiceType(data.serviceType || "");
      setRoomConfigs(data.roomConfigs || {});
      setPathChoice(data.pathChoice || null);
      setFlooringPath(data.flooringPath || "know");
      setShowWelcomeBack(true);
    } catch(e) {}
  }, []);

  // ── localStorage auto-save
  useEffect(() => {
    if (step === 0) return;
    try {
      localStorage.setItem("strata_quote_v1", JSON.stringify({
        data: { step, measureSubStep, step2Sub, propertyType, selectedRooms, bedroomCount, dimensions, selectedFlooring, flooringGrade, selectedPileStyle, selectedVinylStyle, currentFloor, subfloor, selectedExtras, budget, timing, serviceType, roomConfigs, pathChoice, flooringPath },
        savedAt: Date.now(),
      }));
    } catch(e) {}
  }, [step, measureSubStep, step2Sub, propertyType, selectedRooms, bedroomCount, dimensions, selectedFlooring, flooringGrade, selectedPileStyle, selectedVinylStyle, currentFloor, subfloor, selectedExtras, budget, timing, serviceType, roomConfigs, pathChoice, flooringPath]);

  // ── localStorage clear on submit
  useEffect(() => {
    if (submitted) { try { localStorage.removeItem("strata_quote_v1"); } catch(e) {} }
  }, [submitted]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    setActiveGallery(0);
    const t = setInterval(() => setActiveGallery(p => (p + 1) % 4), 4500);
    return () => clearInterval(t);
  }, [isMobile]);
  const galleryImages = isMobile === false ? desktopImages : mobileImages;

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
  const allRoomsHaveFlooring = expandedRooms.length > 0 && expandedRooms.every(r => !!roomConfigs[r]?.flooring);
  const currentEncouragement =
    step === 0 ? "Most people are done in under 2 minutes. No phone calls. No waiting. Just a real price." :
    step === 1 && measureSubStep === "educate" ? "No tape measure? Your phone has one built in. We'll walk you through it." :
    step === 1 && measureSubStep === "measure" ? "Rough is fine — our surveyor confirms every measurement in person before anything is ordered." :
    step === 2 && step2Sub === "path" ? "No wrong answer. If you're not sure what you want, we love helping figure that out." :
    step === 2 && step2Sub === "help" ? "The more you tell us, the better. Lifestyle details matter as much as room size." :
    step === 2 && step2Sub === "room-config" ? "Nearly there — this is the last detailed section before your estimate." :
    step === 3 ? "This takes 30 seconds and helps us bring exactly what's needed on the day. No surprises." :
    step === 4 ? "Two more quick questions and you're done." :
    step === 5 ? "Last step. Your personalised estimate is ready and waiting." : null;


  const stepTitles = [
    "Your project",
    measureSubStep === "educate" ? "Before you measure" : "Measure your rooms",
    step2Sub === "help" ? "Tell us what you need" : step2Sub === "room-config" ? "Configure your rooms" : "What flooring?",
    "Current floor & extras",
    "Budget & timing",
    "Almost done.",
  ];

  // ── Flo intercept: ask Flo for flooring recommendation
  const handleFloAsk = async () => {
    const text = interceptInput.trim();
    if (!text || interceptLoading) return;
    setInterceptLoading(true);
    try {
      const res = await fetch("https://www.stratafloors.co.uk/api/flo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I need a flooring recommendation. ${text}. Property: ${propertyType}. Rooms: ${selectedRooms.join(", ")}`,
          context: { role: "customer" },
          history: [],
        }),
      });
      console.log('[Flo] Status:', res.status);
      if (!res.ok) {
        const errText = await res.text();
        console.error('[Flo] Error body:', errText);
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      const responseText = data.response || "I'd suggest LVT for most rooms — it's durable, waterproof, and looks great.";
      const knownFloorings = ["Carpet", "LVT", "Laminate", "Vinyl"];
      const detected = knownFloorings.find(f => responseText.toLowerCase().includes(f.toLowerCase()));
      setInterceptInput("");
      setInterceptResponse({ text: responseText, flooring: detected || null });
    } catch (err) {
      console.error('[Flo] Fetch error:', err.message);
      setInterceptInput("");
      setInterceptResponse({ text: "I'd suggest LVT — it works in almost any room and is very easy to maintain.", flooring: "LVT" });
    } finally {
      setInterceptLoading(false);
    }
  };

  const scrollToQuote = () => {
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleAskExpert = () => {
    if (isMobile) {
      window.location.href = "/flo";
    } else {
      window.dispatchEvent(new CustomEvent("open-flo"));
      document.getElementById("flo-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ background: s.bg, color: s.text, minHeight: "100vh", overflowX: "hidden", fontFamily: s.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .mq-track { display: flex; gap: 48px; animation: mq 28s linear infinite; white-space: nowrap; will-change: transform; }
        @keyframes mq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .row-card { background: #1a1a18; border: 1px solid #2a2a28; border-radius: 4px; padding: 14px 16px; margin-bottom: 6px; }
        .floor-card { display: flex; align-items: center; border: 1px solid #2a2a28; border-radius: 4px; overflow: hidden; cursor: pointer; transition: all 0.25s ease; margin-bottom: 6px; }
        .floor-card:hover { border-color: rgba(201,169,110,0.5); }
        .floor-card.selected { border-color: #c9a96e; background: rgba(201,169,110,0.08); }
        .pile-card { width: 100px; flex-shrink: 0; border: 1px solid #2a2a28; border-radius: 6px; padding: 8px 6px; cursor: pointer; background: #111110; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.18s ease; overflow: hidden; }
        .pile-card:hover { border-color: rgba(201,169,110,0.4); transform: translateY(-2px); }
        .pile-card.selected { border-color: #c9a96e; background: rgba(201,169,110,0.1); box-shadow: 0 0 0 1px rgba(201,169,110,0.3); }
        .vinyl-photo-card { width: 100px; flex-shrink: 0; border: 1px solid #2a2a28; border-radius: 6px; overflow: hidden; cursor: pointer; background: #111110; display: flex; flex-direction: column; align-items: center; transition: all 0.18s ease; padding: 0; }
        .vinyl-photo-card:hover { border-color: rgba(201,169,110,0.4); transform: translateY(-2px); }
        .vinyl-photo-card.selected { border-color: #c9a96e; box-shadow: 0 0 0 1px rgba(201,169,110,0.3); }
        .style-cards-grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: flex-start; }
        @media (min-width: 480px) { .style-cards-grid { justify-content: flex-start; } }
        .mat-card { border-radius: 6px; overflow: hidden; position: relative; height: 140px; cursor: pointer; }
        .mat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; display: block; }
        .mat-card:hover img { transform: scale(1.05); }
        .mat-card-tier:hover img { transform: scale(1.06); }
        .popular-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 20px; }
        @media (min-width: 640px) { .popular-grid { grid-template-columns: 1fr 1fr 1fr; } .mat-card { height: 200px; } }
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
        .flo-estimate-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 48px; background: rgba(17,17,16,0.98); border-top: 1px solid rgba(201,169,110,0.3); padding: 0 20px; z-index: 40; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes calcPulse { 0%,100%{opacity:0.35} 50%{opacity:0.85} }
        @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmerSweep { 0% { transform:translateX(-100%); } 100% { transform:translateX(200%); } }
        @keyframes floVoiceFade { 0%{opacity:0;transform:translateY(6px)} 15%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-4px)} }
        @keyframes progressIn { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        @keyframes waveform { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        .quote-mini-visualiser svg { max-height: 180px; }
        .nav-expert-short { display: inline; }
        .nav-expert-long  { display: none; }
        .nav-quote-btn    { display: none !important; }
        @media (min-width: 480px) {
          .nav-links        { display: flex !important; gap: 24px; align-items: center; }
          .nav-expert-short { display: none; }
          .nav-expert-long  { display: inline; }
          .nav-quote-btn    { display: inline-block !important; }
        }
        @media (min-width: 640px) { .hero-h1 { font-size: 52px !important; } }
        @media (max-width: 430px) { .quote-mini-visualiser { padding: 8px !important; } .quote-mini-visualiser svg { max-height: 180px !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: scrollY > 60 ? "rgba(17,17,16,0.95)" : "transparent", backdropFilter: scrollY > 60 ? "blur(16px)" : "none", borderBottom: scrollY > 60 ? `1px solid ${s.border}` : "none", transition: "all 0.4s", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
          <div style={{ fontFamily: s.serif, fontSize: "20px", fontWeight: 700, letterSpacing: "0.12em", color: s.text, lineHeight: 1.1 }}>STRATA</div>
          <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: "8.5px", fontWeight: 300, letterSpacing: "0.2em", color: "rgba(242,237,224,0.3)", textTransform: "uppercase", marginTop: "1px" }}>Superior Flooring</div>
        </button>
        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#about" className="nav-link">About</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={handleAskExpert} style={{ background: "#1a1a18", border: `1px solid ${s.gold}`, color: s.gold, padding: "9px 14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px", cursor: "pointer", fontFamily: s.sans, whiteSpace: "nowrap" }}>
            <span className="nav-expert-short">Ask Flo →</span>
            <span className="nav-expert-long">Ask our expert</span>
          </button>
          <a href="/" onClick={e => { e.preventDefault(); scrollToQuote(); }} className="nav-quote-btn" style={{ background: s.gold, color: "#111", padding: "9px 18px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "2px", whiteSpace: "nowrap" }}>Free Quote</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {galleryImages.map((img, i) => (
            <Image key={i} src={img.url} alt={img.label} fill sizes="100vw" quality={100} priority={i === 0} style={{ objectFit: "cover", objectPosition: img.pos, opacity: i === activeGallery ? 1 : 0, transition: "opacity 1.4s ease" }} />
          ))}
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

      {/* FLO */}
      <div id="flo-section"><FloSection /></div>

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
          {stats.map((st, i) => <StatBox key={i} value={st.value} label={st.label} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "0 20px 48px" }}>
        <Tag>How it works</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "16px" }}>
          Straightforward from<br /><span style={{ color: s.gold, fontStyle: "italic" }}>start to finish</span>
        </div>
        {howItWorksSteps.map((st, i) => (
          <StepCard key={i} num={st.num} title={st.title} body={st.body} delay={i * 100} />
        ))}
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: "0 20px 48px" }}>
        <Tag>Straight with you</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "16px" }}>
          We&apos;re new.<br /><span style={{ color: s.gold, fontStyle: "italic" }}>Our work isn&apos;t.</span>
        </div>
        <Divider />
        <div style={{ background: s.card, borderLeft: `3px solid ${s.gold}`, borderTop: `1px solid ${s.border}`, borderRight: `1px solid ${s.border}`, borderBottom: `1px solid ${s.border}`, borderRadius: "0 4px 4px 0", padding: "28px 24px", marginBottom: "16px" }}>
          <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "20px" }}>
            Strata launched recently. We don&apos;t have hundreds of reviews yet — and we&apos;re not going to make any up. What we do have is over two decades of flooring experience behind every job we take on, a surveyor who visits before anything is ordered, and a simple promise: the price you&apos;re quoted is the price you pay. Our first reviews will be real ones. Watch this space.
          </div>
          <a href="https://g.page/r/placeholder" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontFamily: s.sans, fontSize: "12px", color: s.gold, textDecoration: "none", letterSpacing: "0.04em" }}>
            Completed a job with us? Leave us a review →
          </a>
        </div>
      </section>

      {/* POPULAR */}
      <section style={{ padding: "0 20px 48px" }}>
        <Tag>What&apos;s popular right now</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "6px" }}>
          The floors people <span style={{ color: s.gold, fontStyle: "italic" }}>actually</span> want
        </div>
        <Divider />
        <div className="popular-grid">
          {[
            { name: "Carpet",    tag: "Most popular",   img: "/carpet.png" },
            { name: "LVT & SPC", tag: "Most versatile", img: "/lvt-herringbone-oak.png" },
            { name: "Laminate",  tag: "Great value",    img: "/laminate-greige-oak.png" },
          ].map(({ name, tag, img }) => (
            <div key={name} className="mat-card">
              <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,16,0.96) 0%, rgba(17,17,16,0.3) 60%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
                <div style={{ fontFamily: s.serif, fontSize: "18px", fontWeight: 700, color: s.text, lineHeight: 1, marginBottom: "4px" }}>{name}</div>
                <div style={{ fontFamily: s.sans, fontSize: "9px", letterSpacing: "0.14em", color: s.gold, textTransform: "uppercase" }}>{tag}</div>
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
      <section id="quote" style={{ padding: `48px 20px ${!submitted && selectedRooms.length > 0 ? "130px" : "80px"}`, background: "rgba(201,169,110,0.025)", borderTop: `1px solid ${s.border}` }}>
        <Tag>Free instant quote</Tag>

        {submitted ? (
          <div style={{ paddingTop: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <AnimatedCheck />
              <div style={{ fontFamily: s.serif, fontSize: "32px", fontWeight: 700, color: s.text, lineHeight: 1.05, marginBottom: "10px" }}>
                You're in,<br /><span style={{ color: s.gold, fontStyle: "italic" }}>{name.split(" ")[0]}.</span>
              </div>
              <p style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.7, fontWeight: 300, maxWidth: "280px", margin: "0 auto" }}>
                We'll call you back as soon as we can to confirm your free survey — someone who actually knows flooring will be on the other end of the phone.
              </p>
            </div>

            {(() => {
              const h = new Date().getHours();
              const fmt12 = (n) => { const v = n % 24; return `${v % 12 || 12}${v >= 12 ? "pm" : "am"}`; };
              const callWindow = h >= 17 ? "First thing tomorrow morning" : `Today between ${fmt12(h + 1)} and ${fmt12(h + 2)}`;
              return (
                <div style={{ border: `1px solid ${s.gold}`, borderRadius: "4px", padding: "18px 20px", marginBottom: "24px", background: "rgba(201,169,110,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ color: s.gold, fontSize: "13px" }}>◆</span>
                    <div style={{ fontFamily: s.serif, fontSize: "22px", color: s.text, fontWeight: 400 }}>We&apos;ll call you within 2 hours.</div>
                  </div>
                  <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, marginBottom: "10px" }}>A real person — not a bot. Someone who knows flooring.</div>
                  <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.gold }}>{callWindow}</div>
                </div>
              );
            })()}

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
              <div style={{ fontFamily: s.serif, fontSize: "22px", color: s.gold, letterSpacing: "0.1em" }}><Typewriter text={refCode.current} delay={600} /></div>
            </div>
          </div>

        ) : (
          <>
            {showWelcomeBack && (
              <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "4px", padding: "12px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <div>
                  <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "12px", color: "rgba(242,237,224,0.7)" }}>◆ Welcome back — your quote has been saved.</div>
                  <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "11px", color: s.dim, marginTop: "3px" }}>You were on step {step + 1} of 6.</div>
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => setShowWelcomeBack(false)} style={{ background: "#c9a96e", color: "#111", border: "none", padding: "7px 14px", fontSize: "11px", fontWeight: 600, borderRadius: "3px", cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>Continue</button>
                  <button onClick={() => {
                    setStep(0); setMeasureSubStep("educate"); setStep2Sub("path"); setPropertyType(""); setSelectedRooms([]); setBedroomCount(1); setDimensions({}); setSelectedFlooring(""); setFlooringGrade(""); setSelectedPileStyle(""); setSelectedVinylStyle(""); setCurrentFloor(""); setSubfloor(""); setSelectedExtras([]); setBudget(""); setTiming(""); setServiceType(""); setRoomConfigs({}); setPathChoice(null); setFlooringPath("know"); setRecommendations(null);
                    try { localStorage.removeItem("strata_quote_v1"); } catch(e) {}
                    setShowWelcomeBack(false);
                  }} style={{ background: "transparent", color: "rgba(242,237,224,0.4)", border: "1px solid #2a2a28", padding: "7px 14px", fontSize: "11px", borderRadius: "3px", cursor: "pointer", fontFamily: "system-ui,sans-serif" }}>Start fresh</button>
                </div>
              </div>
            )}
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
                  {[
                    { type: "Residential", icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                        <path d="M7 18V12h6v6"/>
                      </svg>
                    )},
                    { type: "Commercial", icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="16" height="15" rx="1"/>
                        <path d="M6 7h2M6 10h2M6 13h2M12 7h2M12 10h2M12 13h2"/>
                        <path d="M8 18v-4h4v4"/>
                      </svg>
                    )},
                  ].map(({ type, icon }) => (
                    <Chip key={type} label={type} selected={propertyType === type} icon={icon} onClick={() => { setPropertyType(type); setSelectedRooms([]); }} />
                  ))}
                </div>
                {propertyType && (
                  <>
                    <div style={{ fontSize: "10px", color: s.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "10px" }}>Which {propertyType === "Commercial" ? "spaces" : "rooms"} need new flooring?</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "16px" }}>
                      {roomsToUse.map(r => <RoomChip key={r} label={r} selected={selectedRooms.includes(r)} onClick={() => toggleRoom(r)}/>)}
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
                <MeasureEducationScreen onContinue={() => setMeasureSubStep("measure")} propertyType={propertyType} />
              </>
            )}

            {/* STEP 1b */}
            {step === 1 && measureSubStep === "measure" && (
              <>
                <BackBtn onClick={() => setMeasureSubStep("educate")}/>
                <Sub>Enter your measurements room by room.</Sub>
                {expandedRooms.map(room => (
                  <RoomCalculator key={room} room={room} data={dimensions[room] || {}} onChange={data => setDim(room, data)} flooringType={selectedFlooring} propertyType={propertyType} />
                ))}
                {totalGrossM2 > 0 && (
                  <div style={{ background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "3px", padding: "14px 16px", marginTop: "8px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: s.sans, fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "3px" }}>Total to order</div>
                      <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.3)" }}>Includes {selectedFlooring === "Vinyl" ? "15%" : "10%"} wastage allowance</div>
                    </div>
                    <div style={{ fontFamily: s.serif, fontSize: "32px", color: s.gold, fontWeight: 300 }}>{totalGrossM2.toFixed(1)} <span style={{ fontSize: "16px" }}>m²</span></div>
                  </div>
                )}
                <GoldBtn onClick={() => { setStep(2); setStep2Sub("path"); }} disabled={!allMeasurementsValid}>Continue →</GoldBtn>
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
                      <SelectCard selected={pathChoice === "know"} onClick={() => setPathChoice("know")} padding="22px 20px">
                        <div style={{ fontFamily: s.serif, fontSize: "22px", fontWeight: 700, color: pathChoice === "know" ? s.gold : s.text, marginBottom: "6px" }}>I know what I want</div>
                        <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, fontWeight: 300, lineHeight: 1.5 }}>Browse flooring types and select your grade</div>
                      </SelectCard>
                      <SelectCard selected={pathChoice === "help"} onClick={() => setPathChoice("help")} padding="22px 20px">
                        <div style={{ fontFamily: s.serif, fontSize: "22px", fontWeight: 700, color: pathChoice === "help" ? s.gold : s.text, marginBottom: "6px" }}>Help me choose</div>
                        <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, fontWeight: 300, lineHeight: 1.5 }}>Describe your home and we'll recommend the best flooring for each room</div>
                      </SelectCard>
                    </div>

                    {pathChoice && <GoldBtn onClick={() => setStep2Sub(pathChoice)}>Continue →</GoldBtn>}
                  </>
                )}

                {/* KNOW — existing flooring type cards */}
                {step2Sub === "know" && (
                  <>
                    <BackBtn onClick={() => setStep2Sub("path")}/>
                    <Sub>Not sure? Our surveyor brings samples — choose in your own home.</Sub>
                    {flooringTypes.map(f => {
                      const isSelected = selectedFlooring === f.name;
                      const hasPanel = isSelected && (f.name === "Carpet" || f.name === "Vinyl");
                      return (
                        <div key={f.name}>
                          <div
                            className={`floor-card${isSelected ? " selected" : ""}`}
                            style={hasPanel ? { borderRadius: "4px 4px 0 0", borderBottom: "none" } : {}}
                            onClick={() => { setSelectedFlooring(f.name); setFlooringGrade(""); }}
                          >
                            {f.img && <Image src={f.img} alt={f.name} width={100} height={90} priority style={{ objectFit: "cover", width: 100, height: 90, display: "block", flexShrink: 0, filter: "none" }}/>}
                            <div style={{ padding: "10px 14px", flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                                <div style={{ fontFamily: s.serif, fontSize: "15px", fontWeight: 700, color: s.text }}>{f.name}</div>
                                <div style={{ fontSize: "9px", color: s.gold, fontFamily: s.sans, letterSpacing: "0.08em", flexShrink: 0, marginLeft: "8px" }}>{f.tag}</div>
                              </div>
                              <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.5)", fontWeight: 300, lineHeight: 1.45 }}>{f.desc}</div>
                            </div>
                          </div>
                          {/* Carpet expansion panel */}
                          {f.name === "Carpet" && isSelected && (
                            <div style={{ borderLeft: "1px solid rgba(201,169,110,0.3)", borderRight: "1px solid rgba(201,169,110,0.3)", borderBottom: "1px solid rgba(201,169,110,0.3)", borderRadius: "0 0 4px 4px", background: "rgba(201,169,110,0.04)", padding: "14px 16px", overflow: "hidden", maxHeight: "1000px", transition: "max-height 0.3s ease" }}>
                              <div style={{ fontSize: "9px", color: s.gold, fontFamily: "system-ui,sans-serif", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>Pile style</div>
                              <div className="style-cards-grid">
                                {[
                                  { id: "twist",   title: "Twist pile",    desc: "Durable · Most popular",           svg: <CarpetTwistSVG/> },
                                  { id: "berber",  title: "Berber / Loop",  desc: "Indestructible · Hides footprints", svg: <CarpetBerberSVG/> },
                                  { id: "saxony",  title: "Saxony",         desc: "Deep · Luxurious · Bedroom",       svg: <CarpetSaxonySVG/> },
                                  { id: "velvet",  title: "Velvet",         desc: "Directional sheen · Formal rooms", svg: <CarpetVelvetSVG/> },
                                  { id: "cutloop", title: "Cut & loop",     desc: "Geometric · Contemporary",         svg: <CarpetCutLoopSVG/> },
                                ].map(({ id, title, desc, svg }) => (
                                  <div key={id} className={`pile-card${selectedPileStyle === id ? " selected" : ""}`} onClick={() => setSelectedPileStyle(id)}>
                                    {svg}
                                    <div style={{ fontFamily: s.serif, fontSize: "12px", fontWeight: 600, color: "#f2ede0", textAlign: "center" }}>{title}</div>
                                    <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "9px", color: "rgba(242,237,224,0.4)", textAlign: "center" }}>{desc}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Vinyl expansion panel */}
                          {f.name === "Vinyl" && isSelected && (
                            <div style={{ borderLeft: "1px solid rgba(201,169,110,0.3)", borderRight: "1px solid rgba(201,169,110,0.3)", borderBottom: "1px solid rgba(201,169,110,0.3)", borderRadius: "0 0 4px 4px", background: "rgba(201,169,110,0.04)", padding: "14px 16px", overflow: "hidden", maxHeight: "400px", transition: "max-height 0.3s ease" }}>
                              <div style={{ fontSize: "9px", color: s.gold, fontFamily: "system-ui,sans-serif", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "10px" }}>Style</div>
                              <div className="style-cards-grid">
                                {[
                                  { id: "Wood effect",   title: "Wood effect",   desc: "Warm · Natural",     img: "/wood-effect-style-vinyl.webp" },
                                  { id: "Marble effect", title: "Marble effect", desc: "Elegant · Statement", img: "/marble-effect-style-vinyl.webp" },
                                  { id: "Stone / tile",  title: "Stone / tile",  desc: "Clean · Modern",      img: "/tile-effect-style-vinyl-png.webp" },
                                  { id: "Patterned",     title: "Patterned",     desc: "Bold · Decorative",   img: "/pattern-effect-style-vinyl.webp" },
                                ].map(({ id, title, desc, img }) => (
                                  <div key={id} className={`vinyl-photo-card${selectedVinylStyle === id ? " selected" : ""}`} onClick={() => setSelectedVinylStyle(id)}>
                                    <Image src={img} alt={title} width={100} height={64} priority style={{ objectFit: "cover", width: "100%", height: "64px", display: "block", filter: "none" }}/>
                                    <div style={{ fontFamily: s.serif, fontSize: "12px", fontWeight: 700, color: "#f2ede0", textAlign: "center", padding: "5px 4px 2px", lineHeight: 1.2 }}>{title}</div>
                                    <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "9px", color: "rgba(242,237,224,0.4)", textAlign: "center", padding: "0 4px 6px", lineHeight: 1.2 }}>{desc}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {isSelected && f.subfloorNote && <GoldNote>{f.subfloorNote}</GoldNote>}
                        </div>
                      );
                    })}
                    {/* Flo intercept — warm split layout (appears after 9 seconds) */}
                    {showFloIntercept && !selectedFlooring && (
                      <div style={{ border: `1px solid rgba(201,169,110,0.3)`, borderRadius: "8px", overflow: "hidden", marginTop: "20px", animation: "slideUp 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
                        {/* Left-right split header */}
                        <div style={{ display: "flex", background: "#0e0e0c" }}>
                          {/* Left — Flo identity */}
                          <div style={{ width: "100px", flexShrink: 0, background: "rgba(201,169,110,0.06)", borderRight: `1px solid rgba(201,169,110,0.15)`, padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(45deg,rgba(201,169,110,0.08) 0,rgba(201,169,110,0.08) 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,rgba(201,169,110,0.04) 0,rgba(201,169,110,0.04) 1px,transparent 0,transparent 50%)`, backgroundSize: "14px 14px" }} />
                            <div style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: s.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontFamily: s.serif, fontStyle: "italic", fontSize: 18, fontWeight: 700, color: "#111" }}>F</span>
                            </div>
                            <div style={{ position: "relative", fontFamily: s.serif, fontStyle: "italic", fontSize: 12, color: s.gold, textAlign: "center", lineHeight: 1.3 }}>Not sure which floor?</div>
                          </div>
                          {/* Right — message */}
                          <div style={{ flex: 1, padding: "16px 16px 14px" }}>
                            <div style={{ fontFamily: s.serif, fontSize: 16, fontWeight: 600, color: s.text, marginBottom: 6 }}>Let me pick for you.</div>
                            <div style={{ fontFamily: s.sans, fontSize: 11.5, color: "rgba(242,237,224,0.55)", lineHeight: 1.65, fontWeight: 300 }}>
                              Tell me about the room — how it's used, who's in it, what matters to you. I'll recommend exactly the right floor.
                            </div>
                          </div>
                        </div>

                        {/* Input area */}
                        <div style={{ background: "#111110", padding: "14px 16px", borderTop: `1px solid rgba(201,169,110,0.1)` }}>
                          {!interceptOpen && !interceptResponse && (
                            <button onClick={() => setInterceptOpen(true)} style={{ background: s.gold, border: "none", borderRadius: "4px", padding: "12px 16px", color: "#111", fontFamily: s.sans, fontSize: "13px", fontWeight: 600, cursor: "pointer", width: "100%", letterSpacing: "0.05em" }}>
                              Tell Flo about your room →
                            </button>
                          )}

                          {interceptOpen && !interceptResponse && (
                            <div>
                              <textarea
                                value={interceptInput}
                                onChange={e => setInterceptInput(e.target.value)}
                                placeholder="e.g. It's a busy kitchen, we have a dog, want something warm and very easy to clean..."
                                rows={3}
                                disabled={interceptLoading}
                                style={{ width: "100%", background: "rgba(242,237,224,0.05)", border: `1px solid rgba(201,169,110,0.2)`, borderRadius: "4px", padding: "10px 12px", color: s.text, fontFamily: s.sans, fontSize: 12.5, resize: "none", outline: "none", marginBottom: 8, boxSizing: "border-box", lineHeight: 1.5 }}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !interceptLoading) { e.preventDefault(); handleFloAsk(); } }}
                              />
                              <button onClick={handleFloAsk} disabled={!interceptInput.trim() || interceptLoading} style={{ background: s.gold, border: "none", borderRadius: "4px", padding: "11px 16px", color: "#111", fontFamily: s.sans, fontSize: 13, fontWeight: 600, cursor: interceptLoading ? "default" : "pointer", opacity: !interceptInput.trim() || interceptLoading ? 0.5 : 1, width: "100%" }}>
                                {interceptLoading ? "Flo is thinking…" : "Send to Flo →"}
                              </button>
                              {interceptLoading && <div style={{ height: 2, background: s.gold, borderRadius: 1, marginTop: 10, animation: "calcPulse 1.2s ease-in-out infinite" }} />}
                            </div>
                          )}

                          {interceptResponse && (
                            <div>
                              <div style={{ fontFamily: s.sans, fontSize: 13, color: s.text, lineHeight: 1.7, marginBottom: 14, padding: "12px 14px", background: "rgba(201,169,110,0.05)", borderRadius: 4, border: `1px solid rgba(201,169,110,0.15)` }}>
                                {interceptResponse.text}
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                {interceptResponse.flooring && (
                                  <button onClick={() => {
                                    setSelectedFlooring(interceptResponse.flooring);
                                    setFlooringGrade("");
                                    setShowFloIntercept(false);
                                    setInterceptResponse(null);
                                    setInterceptOpen(false);
                                  }} style={{ flex: 2, padding: "12px", background: s.gold, color: "#111", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: 600, fontFamily: s.sans, cursor: "pointer" }}>
                                    Use {interceptResponse.flooring} →
                                  </button>
                                )}
                                <button onClick={() => { setShowFloIntercept(false); setInterceptResponse(null); setInterceptOpen(false); }} style={{ flex: 1, padding: "12px", background: "transparent", color: s.dim, border: `1px solid ${s.border}`, borderRadius: "4px", fontSize: "13px", fontFamily: s.sans, cursor: "pointer" }}>
                                  Browse all
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: "16px" }}>
                      <GoldBtn onClick={() => {
                        setFlooringPath("know");
                        const pre = {};
                        expandedRooms.forEach(r => {
                          pre[r] = {
                            ...(roomConfigs[r] || {}),
                            flooring: selectedFlooring,
                            ...(selectedPileStyle  && { pileStyle: selectedPileStyle }),
                            ...(selectedVinylStyle && { style: selectedVinylStyle }),
                          };
                        });
                        setRoomConfigs(p => ({ ...p, ...pre }));
                        setStep2Sub("room-config");
                      }} disabled={!selectedFlooring}>Configure rooms →</GoldBtn>
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
                            {flooringTypes.map(f => (
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

                              {/* ── CARPET CONFIG ─────────────────────── */}
                              {roomFlooring === "Carpet" && (
                                <>
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Pile style</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {id:"twist",   label:"Twist pile",    desc:"Durable · Practical · Most popular",       svg:<CarpetTwistSVG/>},
                                      {id:"berber",  label:"Berber / Loop", desc:"Indestructible · Hides footprints",        svg:<CarpetBerberSVG/>},
                                      {id:"saxony",  label:"Saxony",        desc:"Deep · Luxurious · Bedroom perfect",       svg:<CarpetSaxonySVG/>},
                                      {id:"velvet",  label:"Velvet",        desc:"Directional sheen · Formal rooms",         svg:<CarpetVelvetSVG/>},
                                      {id:"cutloop", label:"Cut & loop",    desc:"Geometric texture · Contemporary",         svg:<CarpetCutLoopSVG/>},
                                    ].map(({ id, label, desc, svg }) => (
                                      <IlCard key={id} selected={config.pileStyle === id} onClick={() => setRoomConfig(room, "pileStyle", id)}>
                                        <div style={{ padding: "10px 10px 2px", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>{svg}</div>
                                        <div style={{ padding: "8px 10px 10px" }}>
                                          <div style={{ fontFamily: s.serif, fontSize: "14px", fontWeight: 700, color: config.pileStyle === id ? s.gold : s.text, marginBottom: "3px" }}>{label}</div>
                                          <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                        </div>
                                      </IlCard>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Grade</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {["Budget", "Mid", "Premium"].map(g => (
                                      <Chip key={g} label={g} selected={roomGrade === g} onClick={() => setRoomConfig(room, "grade", g)}/>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Underlay</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {id:"keep",     label:"Keep existing",  desc:"Only available if current floor is carpet"},
                                      {id:"budget",   label:"Budget",         desc:"7mm PU foam"},
                                      {id:"mid",      label:"Mid",            desc:"10mm PU foam"},
                                      {id:"premium",  label:"Premium",        desc:"12mm memory foam"},
                                      {id:"acoustic", label:"Acoustic",       desc:"Required in flats and apartments"},
                                    ].filter(u => u.id !== "keep" || config.currentFloor === "Carpet").map(({ id, label, desc }) => (
                                      <SelectCard key={id} selected={config.underlay === id} onClick={() => setRoomConfig(room, "underlay", id)} padding="10px 12px">
                                        <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: config.underlay === id ? s.gold : s.text, marginBottom: "2px" }}>{label}</div>
                                        <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                      </SelectCard>
                                    ))}
                                  </div>
                                  {config.underlay === "acoustic" && (
                                    <GoldNote>Building regulations in most leases require acoustic underlay above ground floor. Check your lease before proceeding.</GoldNote>
                                  )}

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Gripper rods</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {["Replace all (recommended)", "Top up only", "Not needed"].map(o => (
                                      <Chip key={o} label={o} selected={config.gripper === o} onClick={() => setRoomConfig(room, "gripper", o)}/>
                                    ))}
                                  </div>

                                  {room === "Stairs" && (
                                    <>
                                      <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Edge finishing</div>
                                      <GoldNote>Whipping and binding finish the cut edges of stair carpet for a clean, professional look and prevent fraying over time.</GoldNote>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                                        {[
                                          {id:"none",     label:"None needed", desc:"Standard finished edges — suitable for most stair carpets."},
                                          {id:"whipping", label:"Whipping",    desc:"Edges stitched with thread for a clean, durable, tailored finish."},
                                          {id:"binding",  label:"Binding",     desc:"Fabric tape bound around edges — more decorative than whipping."},
                                        ].map(({ id, label, desc }) => (
                                          <SelectCard key={id} selected={config.edgeFinish === id} onClick={() => setRoomConfig(room, "edgeFinish", id)} padding="10px 14px">
                                            <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: config.edgeFinish === id ? s.gold : s.text }}>{label}</div>
                                            <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, fontWeight: 300, marginTop: "2px" }}>{desc}</div>
                                          </SelectCard>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Current floor covering</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {["Carpet", "Hard floor", "Tiles", "Vinyl", "Bare / nothing"].map(o => (
                                      <Chip key={o} label={o} selected={config.currentFloor === o} onClick={() => setRoomConfig(room, "currentFloor", o)}/>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* ── LVT CONFIG ────────────────────────── */}
                              {roomFlooring === "LVT" && (
                                <>
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Format</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {id:"plank",       label:"Plank",       desc:"Wood effect · Most popular",    svg:<LVTPlankSVG/>},
                                      {id:"tile",        label:"Large tile",  desc:"Stone / concrete effect",       svg:<LVTTileSVG/>},
                                      {id:"herringbone", label:"Herringbone", desc:"Pattern statement · Premium",   svg:<LVTHerringboneSVG/>},
                                    ].map(({ id, label, desc, svg }) => (
                                      <IlCard key={id} selected={config.lvtFormat === id} onClick={() => setRoomConfig(room, "lvtFormat", id)}>
                                        <div style={{ padding: "10px 10px 2px", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>{svg}</div>
                                        <div style={{ padding: "8px 8px 10px" }}>
                                          <div style={{ fontFamily: s.serif, fontSize: "14px", fontWeight: 700, color: config.lvtFormat === id ? s.gold : s.text, marginBottom: "3px" }}>{label}</div>
                                          <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                        </div>
                                      </IlCard>
                                    ))}
                                  </div>

                                  {config.lvtFormat && (
                                    <>
                                      <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Effect</div>
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                        {["Light oak", "Mid oak", "Dark walnut", "Grey wood", "Stone / slate", "Concrete"].map(o => (
                                          <Chip key={o} label={o} selected={config.lvtEffect === o} onClick={() => setRoomConfig(room, "lvtEffect", o)}/>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Core type</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {id:"click", label:"Click floating",  desc:"Easiest install — most popular for residential"},
                                      {id:"rigid", label:"Rigid core SPC",  desc:"Best for underfloor heating, most dimensionally stable"},
                                      {id:"glue",  label:"Glue down",       desc:"Flattest finish — true commercial grade"},
                                    ].map(({ id, label, desc }) => (
                                      <SelectCard key={id} selected={config.lvtCore === id} onClick={() => setRoomConfig(room, "lvtCore", id)} padding="10px 12px">
                                        <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: config.lvtCore === id ? s.gold : s.text, marginBottom: "2px" }}>{label}</div>
                                        <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                      </SelectCard>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Wear layer grade</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {["Budget 0.3mm", "Mid 0.55mm", "Premium 0.7mm+"].map(g => (
                                      <Chip key={g} label={g} selected={roomGrade === g} onClick={() => setRoomConfig(room, "grade", g)}/>
                                    ))}
                                  </div>

                                  {subfloor === "Concrete" && <GoldNote>Concrete subfloors often need latex levelling before LVT can be laid. We'll assess at survey.</GoldNote>}
                                  {subfloor === "Timber / boards" && <GoldNote>Timber subfloors usually need ply boarding before LVT is laid. We'll assess at survey.</GoldNote>}

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Current floor covering</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {["Carpet", "Hard floor", "Tiles", "Vinyl", "Bare / nothing"].map(o => (
                                      <Chip key={o} label={o} selected={config.currentFloor === o} onClick={() => setRoomConfig(room, "currentFloor", o)}/>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* ── LAMINATE CONFIG ───────────────────── */}
                              {roomFlooring === "Laminate" && (
                                <>
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Effect</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {id:"natural",     label:"Natural oak",    desc:"Classic · Warm · Timeless",         svg:<LaminateNaturalSVG/>},
                                      {id:"grey",        label:"Grey / smoked",  desc:"Contemporary · Sophisticated",      svg:<LaminateGreySVG/>},
                                      {id:"herringbone", label:"Herringbone",    desc:"Bold pattern · Statement floors",   svg:<LaminateHerringboneSVG/>},
                                    ].map(({ id, label, desc, svg }) => (
                                      <IlCard key={id} selected={config.laminateEffect === id} onClick={() => setRoomConfig(room, "laminateEffect", id)}>
                                        <div style={{ padding: "10px 10px 2px", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>{svg}</div>
                                        <div style={{ padding: "8px 10px 10px" }}>
                                          <div style={{ fontFamily: s.serif, fontSize: "14px", fontWeight: 700, color: config.laminateEffect === id ? s.gold : s.text, marginBottom: "3px" }}>{label}</div>
                                          <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                        </div>
                                      </IlCard>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Grade</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {label:"8mm Budget",     desc:"Standard entry-level laminate"},
                                      {label:"10–12mm Mid",    desc:"Acoustic underlay — quieter and more solid underfoot"},
                                      {label:"12mm+ Premium",  desc:"The closest to real wood without the price tag"},
                                    ].map(({ label, desc }) => (
                                      <SelectCard key={label} selected={roomGrade === label} onClick={() => setRoomConfig(room, "grade", label)} padding="10px 12px">
                                        <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: roomGrade === label ? s.gold : s.text, marginBottom: "2px" }}>{label}</div>
                                        <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                      </SelectCard>
                                    ))}
                                  </div>

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Current floor covering</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {["Carpet", "Hard floor", "Tiles", "Vinyl", "Bare / nothing"].map(o => (
                                      <Chip key={o} label={o} selected={config.currentFloor === o} onClick={() => setRoomConfig(room, "currentFloor", o)}/>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* ── VINYL SHEET CONFIG ────────────────── */}
                              {roomFlooring === "Vinyl" && (
                                <>
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Style</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {id:"wood",  label:"Wood effect",      desc:"Warm · Easy to maintain",       svg:<VinylWoodSVG/>},
                                      {id:"stone", label:"Stone / geometric", desc:"Clean · Modern · Durable",     svg:<VinylStoneSVG/>},
                                      {id:"plain", label:"Plain / solid",     desc:"Practical · Hygienic · Simple", svg:<VinylPlainSVG/>},
                                    ].map(({ id, label, desc, svg }) => (
                                      <IlCard key={id} selected={config.vinylStyle === id} onClick={() => setRoomConfig(room, "vinylStyle", id)}>
                                        <div style={{ padding: "10px 10px 2px", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>{svg}</div>
                                        <div style={{ padding: "8px 10px 10px" }}>
                                          <div style={{ fontFamily: s.serif, fontSize: "14px", fontWeight: 700, color: config.vinylStyle === id ? s.gold : s.text, marginBottom: "3px" }}>{label}</div>
                                          <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                        </div>
                                      </IlCard>
                                    ))}
                                  </div>

                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                                    {[
                                      {label:"Domestic cushioned", desc:"Soft underfoot — residential and light commercial"},
                                      {label:"Heavy duty",         desc:"Reinforced backing — high traffic and commercial"},
                                    ].map(({ label, desc }) => (
                                      <SelectCard key={label} selected={roomGrade === label} onClick={() => setRoomConfig(room, "grade", label)} padding="10px 12px">
                                        <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: roomGrade === label ? s.gold : s.text, marginBottom: "2px" }}>{label}</div>
                                        <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim }}>{desc}</div>
                                      </SelectCard>
                                    ))}
                                  </div>

                                  {subfloor === "Concrete" && <GoldNote>Concrete subfloors often need latex levelling before vinyl can be laid. We'll assess at survey.</GoldNote>}
                                  {subfloor === "Timber / boards" && <GoldNote>Timber subfloors usually need ply boarding before vinyl is laid. We'll assess at survey.</GoldNote>}

                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Current floor covering</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {["Carpet", "Hard floor", "Tiles", "Vinyl", "Bare / nothing"].map(o => (
                                      <Chip key={o} label={o} selected={config.currentFloor === o} onClick={() => setRoomConfig(room, "currentFloor", o)}/>
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* ── OTHER / FALLBACK ──────────────────── */}
                              {roomFlooring !== "Carpet" && roomFlooring !== "LVT" && roomFlooring !== "Laminate" && roomFlooring !== "Vinyl" && (
                                <>
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Grade</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
                                    {["Budget", "Mid", "Premium"].map(g => (
                                      <Chip key={g} label={g} selected={roomGrade === g} onClick={() => setRoomConfig(room, "grade", g)}/>
                                    ))}
                                  </div>
                                  <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "8px" }}>Current floor covering</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                    {["Carpet", "Hard floor", "Tiles", "Vinyl", "Bare / nothing"].map(o => (
                                      <Chip key={o} label={o} selected={config.currentFloor === o} onClick={() => setRoomConfig(room, "currentFloor", o)}/>
                                    ))}
                                  </div>
                                </>
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
                    <SelectCard key={ex.id} selected={selectedExtras.includes(ex.id)} onClick={() => toggleExtra(ex.id)} padding="12px 14px">
                      <div style={{ fontFamily: s.sans, fontSize: "13px", fontWeight: 600, color: selectedExtras.includes(ex.id) ? s.gold : s.text, marginBottom: "3px" }}>{ex.label}</div>
                      <div style={{ fontFamily: s.sans, fontSize: "11px", color: s.dim, fontWeight: 300, lineHeight: 1.5 }}>{ex.desc}</div>
                    </SelectCard>
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
                <div style={{ fontFamily: s.serif, fontSize: "20px", fontStyle: "italic", color: s.gold, lineHeight: 1.45, marginBottom: "24px" }}>
                  Your indicative estimate is ready — enter your details to reveal it.
                </div>
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

                {/* Zero commitment statement */}
                <div style={{ fontFamily: s.sans, fontSize: "11px", fontStyle: "italic", color: s.gold, textAlign: "center", marginBottom: "12px", opacity: 0.8 }}>
                  The survey is completely free. No obligation to go ahead. We&apos;ll call to arrange a time that suits you.
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
                      flooring_type:    flooringDisplay,
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

                  // Schedule WhatsApp follow-up for 30 minutes later
                  setTimeout(() => {
                    fetch("/api/leads/whatsapp-followup", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, phone, reference: refCode.current }),
                    }).catch(() => {});
                  }, 1800000); // 30 minutes
                }} disabled={!canSubmit}>Book my free survey →</GoldBtn>
                <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.18)", textAlign: "center", fontFamily: s.sans, marginTop: "10px", lineHeight: 1.6 }}>
                  We'll call you back as soon as possible.<br />No obligation. No hard sell. Ever.
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* LIVE ESTIMATE BAR — only after dimensions entered */}
      {!submitted && allMeasurementsValid && totalGrossM2 > 0 && liveEstimate.low > 0 && (
        <>
          {/* Tap-away overlay */}
          {estimateExpanded && (
            <div style={{ position: "fixed", inset: 0, zIndex: 38 }} onClick={() => setEstimateExpanded(false)} />
          )}

          {/* Expanded breakdown card */}
          {estimateExpanded && (
            <div style={{ position: "fixed", bottom: 48, left: 0, right: 0, background: s.bg, border: `1px solid ${s.border}`, borderTop: `1px solid rgba(201,169,110,0.2)`, borderRadius: "12px 12px 0 0", padding: "20px", zIndex: 39, maxWidth: 600, margin: "0 auto" }}>
              <div style={{ fontFamily: s.sans, fontSize: 10, color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Estimate breakdown</div>
              {liveEstimate.breakdown.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontFamily: s.sans, fontSize: 13, color: s.dim }}>{item.label}</span>
                  <span style={{ fontFamily: s.serif, fontSize: 15, color: s.text }}>£{item.low.toLocaleString("en-GB")} – £{item.high.toLocaleString("en-GB")}</span>
                </div>
              ))}
              <div style={{ height: 1, background: s.border, margin: "12px 0 10px" }} />
              <p style={{ fontFamily: s.sans, fontSize: 11, color: s.dim, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>Indicative only — confirmed at survey</p>
            </div>
          )}

          {/* Bar */}
          <div className="flo-estimate-bar" onClick={() => setEstimateExpanded(e => !e)}>
            <div>
              <div style={{ fontFamily: s.sans, fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase" }}>ESTIMATED TOTAL</div>
              {step === 5 && <div style={{ fontFamily: s.sans, fontSize: "9px", color: "rgba(201,169,110,0.5)", marginTop: 2 }}>Full breakdown on next screen</div>}
            </div>
            {isCalculating ? (
              <div style={{ fontFamily: s.serif, fontSize: "20px", color: s.gold, animation: "calcPulse 0.9s ease-in-out infinite" }}>Calculating…</div>
            ) : (
              <div style={{ fontFamily: s.serif, fontSize: "20px", color: s.gold }}>
                £{liveEstimate.low.toLocaleString("en-GB")} — £{liveEstimate.high.toLocaleString("en-GB")}
              </div>
            )}
          </div>
        </>
      )}

      {/* PHONE INTERCEPT MODAL */}
      {showPhoneModal && (
        <>
          <div onClick={() => setShowPhoneModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(17,17,16,0.82)", zIndex: 200, backdropFilter: "blur(6px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, width: "min(92vw, 420px)", background: "#111110", border: `1px solid rgba(201,169,110,0.35)`, borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ background: "rgba(201,169,110,0.07)", padding: "28px 28px 24px", borderBottom: `1px solid rgba(201,169,110,0.15)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: s.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: s.serif, fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "#111" }}>F</span>
                </div>
                <div>
                  <div style={{ fontFamily: s.serif, fontSize: 18, fontWeight: 600, color: s.text }}>Before you call…</div>
                  <div style={{ fontFamily: s.sans, fontSize: 11, color: "rgba(242,237,224,0.45)", marginTop: 2 }}>Flo can usually answer faster than a phone queue</div>
                </div>
              </div>
              <p style={{ fontFamily: s.sans, fontSize: 13, color: "rgba(242,237,224,0.65)", lineHeight: 1.7, margin: 0 }}>
                Flo is Strata's flooring expert — she's available right now and can give you pricing guidance, material advice, or help you book your free survey in under 2 minutes. No hold music.
              </p>
            </div>
            <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setShowPhoneModal(false); document.getElementById("flo-section")?.scrollIntoView({ behavior: "smooth" }); }} style={{ width: "100%", background: s.gold, color: "#111", border: "none", borderRadius: "4px", padding: "15px", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: s.sans }}>
                Chat with Flo now →
              </button>
              <a href="tel:01234567890" onClick={() => setShowPhoneModal(false)} style={{ display: "block", width: "100%", background: "transparent", color: "rgba(242,237,224,0.45)", border: `1px solid rgba(242,237,224,0.15)`, borderRadius: "4px", padding: "13px", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: s.sans, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
                Call anyway — 01234 567890
              </a>
            </div>
          </div>
        </>
      )}

      {/* FOOTER */}
      <footer style={{ padding: "40px 20px", borderTop: `1px solid ${s.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
          <div>
            <div style={{ fontFamily: s.serif, fontSize: "20px", fontWeight: 700, letterSpacing: "0.1em" }}>STRATA</div>
            <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: "8px", fontWeight: 300, letterSpacing: "0.2em", color: "rgba(242,237,224,0.25)", textTransform: "uppercase", marginTop: "1px" }}>Superior Flooring</div>
          </div>
          <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.2)" }}>© 2026 Strata · Essex & London · All rights reserved.</div>
        </div>
        <div style={{ borderTop: `1px solid ${s.border}`, paddingTop: "20px", display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <a href="/fitter/apply" style={{ fontFamily: s.sans, fontSize: "10px", color: "rgba(242,237,224,0.2)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "rgba(242,237,224,0.4)"} onMouseLeave={e => e.target.style.color = "rgba(242,237,224,0.2)"}>Are you a fitter? Join Strata →</a>
          <a href="/surveyor/apply" style={{ fontFamily: s.sans, fontSize: "10px", color: "rgba(242,237,224,0.2)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "rgba(242,237,224,0.4)"} onMouseLeave={e => e.target.style.color = "rgba(242,237,224,0.2)"}>Interested in surveying? Apply here →</a>
        </div>
      </footer>
    </div>
  );
}
