"use client";
import { useState } from "react";
import { useQuoteForm } from "../QuoteFormProvider";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER, btn } from "../tokens";
import BackButton from "../shared/BackButton";
import ProgressDots from "../shared/ProgressDots";

const BASE_ROOMS = [
  { id: "Living Room",    icon: "🛋", label: "Living Room" },
  { id: "Dining Room",   icon: "🍽", label: "Dining Room" },
  { id: "Master Bedroom",icon: "🛏", label: "Master Bedroom" },
  { id: "Hallway",       icon: "🚪", label: "Hallway" },
  { id: "Landing",       icon: "↕", label: "Landing" },
  { id: "Stairs",        icon: "↗", label: "Stairs" },
  { id: "Kitchen",       icon: "🍳", label: "Kitchen" },
  { id: "Bathroom",      icon: "🚿", label: "Bathroom" },
  { id: "Conservatory",  icon: "🌿", label: "Conservatory" },
];

export default function RoomSelector({ onBack, onNext }) {
  const { state, dispatch } = useQuoteForm();
  const { selectedRooms, additionalBedrooms } = state.homeowner;
  const [extra, setExtra] = useState(additionalBedrooms);

  const toggle = (id) => {
    const next = selectedRooms.includes(id)
      ? selectedRooms.filter((r) => r !== id)
      : [...selectedRooms, id];
    dispatch({ type: "HO_SET_ROOMS", payload: next });
  };

  const addBedroom = () => {
    const n = extra + 1;
    setExtra(n);
    dispatch({ type: "HO_SET_ADDITIONAL_BEDROOMS", payload: n });
    const bedroomRooms = Array.from({ length: n }, (_, i) => `Bedroom ${i + 2}`);
    const base = selectedRooms.filter((r) => !r.startsWith("Bedroom "));
    dispatch({ type: "HO_SET_ROOMS", payload: [...base, ...bedroomRooms] });
  };

  const removeBedroom = () => {
    if (extra === 0) return;
    const n = extra - 1;
    setExtra(n);
    dispatch({ type: "HO_SET_ADDITIONAL_BEDROOMS", payload: n });
    const bedroomRooms = n > 0 ? Array.from({ length: n }, (_, i) => `Bedroom ${i + 2}`) : [];
    const base = selectedRooms.filter((r) => !r.startsWith("Bedroom "));
    dispatch({ type: "HO_SET_ROOMS", payload: [...base, ...bedroomRooms] });
  };

  const canContinue = selectedRooms.length > 0;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={onBack} />
        <ProgressDots total={3} current={0} />
        <div style={{ width: 52 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "32px 24px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(26px, 5vw, 40px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
          Which rooms are we looking at?
        </h2>
        <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 32px" }}>
          Select all that apply. We'll configure each one individually.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="room-grid">
          {BASE_ROOMS.map((room) => {
            const active = selectedRooms.includes(room.id);
            return (
              <button
                key={room.id}
                onClick={() => toggle(room.id)}
                style={{
                  background: active ? GOLD_DIM : SURFACE,
                  border: `1px solid ${active ? GOLD : BORDER}`,
                  borderRadius: 12,
                  padding: "20px 12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 22 }}>{room.icon}</span>
                <span style={{ color: active ? TEXT : MUTED, fontFamily: "var(--font-outfit)", fontSize: 12, fontWeight: active ? 600 : 400, textAlign: "center" }}>
                  {room.label}
                </span>
                {active && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Additional bedrooms */}
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontSize: 14, fontWeight: 500 }}>Additional bedrooms</div>
            <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 12, marginTop: 2 }}>
              {extra === 0 ? "Tap + to add" : `${extra} added`}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={removeBedroom}
              disabled={extra === 0}
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${BORDER}`, background: "transparent", color: extra === 0 ? BORDER : MUTED, fontSize: 18, cursor: extra === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >−</button>
            <span style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 16, minWidth: 20, textAlign: "center" }}>{extra}</span>
            <button
              onClick={addBedroom}
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${GOLD_BORDER}`, background: GOLD_DIM, color: GOLD, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >+</button>
          </div>
        </div>

        {/* Selection summary */}
        {selectedRooms.length > 0 && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(201,169,110,0.06)", borderRadius: 8 }}>
            <span style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 12 }}>
              {selectedRooms.length} room{selectedRooms.length !== 1 ? "s" : ""} selected: {selectedRooms.join(", ")}
            </span>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            ...btn,
            marginTop: 32,
            width: "100%",
            padding: "16px",
            fontSize: 16,
            opacity: canContinue ? 1 : 0.35,
            cursor: canContinue ? "pointer" : "default",
          }}
        >
          Configure rooms →
        </button>
      </div>

      <style>{`
        @media (max-width: 480px) { .room-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}
