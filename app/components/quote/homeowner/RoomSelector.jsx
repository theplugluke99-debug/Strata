"use client";
import { useState } from "react";
import { useQuoteForm } from "../QuoteFormProvider";
import { SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER, btn } from "../tokens";
import BackButton from "../shared/BackButton";
import ProgressDots from "../shared/ProgressDots";

// ── Icons ──────────────────────────────────────────────────────────────────
const ic = {
  "Living Room": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="11" width="20" height="7" rx="2"/>
      <rect x="2" y="9" width="4" height="5" rx="1"/>
      <rect x="18" y="9" width="4" height="5" rx="1"/>
      <line x1="6" y1="18" x2="6" y2="22"/>
      <line x1="18" y1="18" x2="18" y2="22"/>
    </svg>
  ),
  "Dining Room": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="9" width="12" height="6" rx="1"/>
      <line x1="9" y1="9" x2="9" y2="6"/>
      <line x1="15" y1="9" x2="15" y2="6"/>
      <line x1="9" y1="15" x2="9" y2="18"/>
      <line x1="15" y1="15" x2="15" y2="18"/>
    </svg>
  ),
  "Kitchen": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2"/>
      <rect x="6" y="12" width="12" height="7" rx="1"/>
      <circle cx="8" cy="8" r="1.8"/>
      <circle cx="16" cy="8" r="1.8"/>
    </svg>
  ),
  "Hallway": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="1"/>
      <circle cx="15.5" cy="12" r="1" fill={c} stroke="none"/>
      <rect x="7" y="4" width="10" height="6" rx="0.5"/>
    </svg>
  ),
  "Landing": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
      <path d="M12 7V12M9.5 9.5L12 7L14.5 9.5" fill="none"/>
    </svg>
  ),
  "Stairs": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20H9V15H14V10H19V5"/>
    </svg>
  ),
  "Study / Home Office": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="10" rx="1"/>
      <line x1="12" y1="13" x2="12" y2="16"/>
      <line x1="9" y1="16" x2="15" y2="16"/>
      <rect x="2" y="17" width="20" height="4" rx="1"/>
    </svg>
  ),
  "Playroom / Nursery": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"/>
      <line x1="4" y1="7.5" x2="20" y2="7.5"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
  ),
  "Conservatory": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L21 9V21H3V9L12 3Z"/>
      <line x1="8" y1="9" x2="8" y2="21"/>
      <line x1="16" y1="9" x2="16" y2="21"/>
      <line x1="3" y1="14" x2="21" y2="14"/>
    </svg>
  ),
  "Utility Room": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="12" cy="13" r="4"/>
      <line x1="3" y1="8" x2="21" y2="8"/>
      <circle cx="7" cy="5.5" r="1" fill={c} stroke="none"/>
      <circle cx="10.5" cy="5.5" r="1" fill={c} stroke="none"/>
    </svg>
  ),
  "Bathroom": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10H20V16A4 4 0 0 1 16 20H8A4 4 0 0 1 4 16V10Z"/>
      <path d="M4 10V7A2 2 0 0 1 8 7V10"/>
      <line x1="7" y1="20" x2="7" y2="22"/>
      <line x1="17" y1="20" x2="17" y2="22"/>
    </svg>
  ),
  "En Suite": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3"/>
      <line x1="12" y1="9" x2="12" y2="11"/>
      <line x1="8" y1="12" x2="6.5" y2="16"/>
      <line x1="10" y1="12" x2="9" y2="17"/>
      <line x1="12" y1="12" x2="12" y2="18"/>
      <line x1="14" y1="12" x2="15" y2="17"/>
      <line x1="16" y1="12" x2="17.5" y2="16"/>
    </svg>
  ),
  "Dressing Room": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5C13.1 5 14 5.9 14 7"/>
      <path d="M12 5C10.9 5 10 5.9 10 7"/>
      <path d="M10 7C10 7 4 10 4 20H20C20 10 14 7 14 7"/>
    </svg>
  ),
  "Gym / Home Gym": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="9" width="4" height="6" rx="1"/>
      <rect x="19" y="9" width="4" height="6" rx="1"/>
      <rect x="5" y="7" width="3" height="10" rx="1"/>
      <rect x="16" y="7" width="3" height="10" rx="1"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  "Garage": (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9L12 3L22 9V22H2V9Z"/>
      <rect x="2" y="9" width="20" height="13"/>
      <line x1="2" y1="13" x2="22" y2="13"/>
      <line x1="2" y1="17" x2="22" y2="17"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
    </svg>
  ),
};

const BedroomIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="18" height="11" rx="2"/>
    <line x1="3" y1="13" x2="21" y2="13"/>
    <rect x="5" y="9.5" width="5" height="3.5" rx="1"/>
    <rect x="14" y="9.5" width="5" height="3.5" rx="1"/>
  </svg>
);

const GRID_ROOMS = Object.keys(ic);

// ── Component ──────────────────────────────────────────────────────────────
export default function RoomSelector({ onBack, onNext }) {
  const { state, dispatch } = useQuoteForm();
  const { selectedRooms } = state.homeowner;

  const [bedroomCount, setBedroomCount] = useState(
    () => selectedRooms.filter((r) => r.startsWith("Bedroom ")).length
  );
  const [shimmering, setShimmering] = useState(new Set());

  const addShimmer = (id) => {
    setShimmering((s) => new Set([...s, id]));
    setTimeout(() => {
      setShimmering((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }, 660);
  };

  const toggle = (id) => {
    const isAdding = !selectedRooms.includes(id);
    const next = isAdding
      ? [...selectedRooms, id]
      : selectedRooms.filter((r) => r !== id);
    dispatch({ type: "HO_SET_ROOMS", payload: next });
    if (isAdding) addShimmer(id);
  };

  const setBedrooms = (count) => {
    const n = Math.max(0, Math.min(8, count));
    const isAdding = n > bedroomCount;
    setBedroomCount(n);
    const bedroomRooms = Array.from({ length: n }, (_, i) => `Bedroom ${i + 1}`);
    const base = selectedRooms.filter((r) => !r.startsWith("Bedroom "));
    dispatch({ type: "HO_SET_ROOMS", payload: [...base, ...bedroomRooms] });
    dispatch({ type: "HO_SET_ADDITIONAL_BEDROOMS", payload: n });
    if (isAdding) addShimmer("__bedrooms__");
  };

  const bedroomActive = bedroomCount > 0;
  const canContinue = selectedRooms.length > 0;

  const cardStyle = (active) => ({
    background: active ? GOLD_DIM : SURFACE,
    border: `1px solid ${active ? GOLD : BORDER}`,
    borderRadius: 12,
    padding: "20px 12px 16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    transition: "border-color 0.2s, background 0.2s",
    position: "relative",
    overflow: "hidden",
  });

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={onBack} />
        <ProgressDots total={3} current={0} />
        <div style={{ width: 52 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "32px 24px 24px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(26px, 5vw, 40px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
          Which rooms are we looking at?
        </h2>
        <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 14, margin: "0 0 28px" }}>
          Select all that apply. We'll configure each one individually.
        </p>

        {/* 2-column room grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {GRID_ROOMS.map((roomId) => {
            const active = selectedRooms.includes(roomId);
            const isShimmering = shimmering.has(roomId);
            return (
              <button key={roomId} onClick={() => toggle(roomId)} style={cardStyle(active)}>
                {isShimmering && <Shimmer />}
                {ic[roomId](active ? GOLD : MUTED)}
                <span style={{
                  color: active ? TEXT : MUTED,
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}>
                  {roomId}
                </span>
                {active && <Dot />}
              </button>
            );
          })}
        </div>

        {/* Bedroom stepper */}
        <div style={{
          marginTop: 10,
          background: bedroomActive ? GOLD_DIM : SURFACE,
          border: `1px solid ${bedroomActive ? GOLD : BORDER}`,
          borderRadius: 12,
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
          transition: "border-color 0.2s, background 0.2s",
        }}>
          {shimmering.has("__bedrooms__") && <Shimmer />}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <BedroomIcon color={bedroomActive ? GOLD : MUTED} />
            <div>
              <div style={{ color: bedroomActive ? TEXT : MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, fontWeight: bedroomActive ? 600 : 400 }}>
                Bedrooms
              </div>
              <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, marginTop: 2 }}>
                {bedroomCount === 0 ? "Tap + to add" : `${bedroomCount} bedroom${bedroomCount !== 1 ? "s" : ""} added`}
              </div>
            </div>
            {bedroomActive && <Dot />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setBedrooms(bedroomCount - 1)}
              disabled={bedroomCount === 0}
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${BORDER}`, background: "transparent", color: bedroomCount === 0 ? BORDER : MUTED, fontSize: 18, cursor: bedroomCount === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
            >−</button>
            <span style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 16, minWidth: 20, textAlign: "center" }}>{bedroomCount}</span>
            <button
              onClick={() => setBedrooms(bedroomCount + 1)}
              disabled={bedroomCount === 8}
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${bedroomCount < 8 ? GOLD_BORDER : BORDER}`, background: bedroomCount < 8 ? GOLD_DIM : "transparent", color: bedroomCount < 8 ? GOLD : BORDER, fontSize: 18, cursor: bedroomCount === 8 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
            >+</button>
          </div>
        </div>

        {/* Selection summary */}
        {selectedRooms.length > 0 && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(201,169,110,0.06)", borderRadius: 8 }}>
            <span style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12 }}>
              {selectedRooms.length} room{selectedRooms.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            ...btn,
            marginTop: 24,
            width: "100%",
            padding: "16px",
            fontSize: 16,
            fontFamily: "system-ui, sans-serif",
            opacity: canContinue ? 1 : 0.38,
            cursor: canContinue ? "pointer" : "default",
          }}
        >
          Configure rooms →
        </button>
        {!canContinue && (
          <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13, textAlign: "center", margin: "10px 0 0" }}>
            Select at least one room to continue
          </p>
        )}
      </div>

      <style>{`
        @keyframes shimmerSlide {
          0%   { transform: translateX(-160%); }
          100% { transform: translateX(160%); }
        }
      `}</style>
    </div>
  );
}

function Shimmer() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.22) 50%, transparent 100%)",
      animation: "shimmerSlide 0.66s ease forwards",
      pointerEvents: "none",
      zIndex: 1,
    }} />
  );
}

function Dot() {
  return <div style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />;
}
