"use client";
import { useState } from "react";
import { useQuoteForm } from "../QuoteFormProvider";
import { SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, btn } from "../tokens";
import BackButton from "../shared/BackButton";
import ProgressDots from "../shared/ProgressDots";
import { RESIDENTIAL_ROOMS, ROOM_ICONS, BedroomIcon } from "./data/rooms";

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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {RESIDENTIAL_ROOMS.map((roomId) => {
            const active = selectedRooms.includes(roomId);
            const isShimmering = shimmering.has(roomId);
            return (
              <button key={roomId} onClick={() => toggle(roomId)} style={cardStyle(active)}>
                {isShimmering && <Shimmer />}
                {ROOM_ICONS[roomId](active ? GOLD : MUTED)}
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
              style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${bedroomCount < 8 ? "#9a7a38" : BORDER}`, background: bedroomCount < 8 ? GOLD_DIM : "transparent", color: bedroomCount < 8 ? GOLD : BORDER, fontSize: 18, cursor: bedroomCount === 8 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
            >+</button>
          </div>
        </div>

        {selectedRooms.length > 0 && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(201,169,110,0.06)", borderRadius: 8 }}>
            <span style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12 }}>
              {selectedRooms.length} room{selectedRooms.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        )}

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
