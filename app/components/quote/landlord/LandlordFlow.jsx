"use client";
import { useState, useEffect } from "react";
import { useQuoteForm, computeEstimate } from "../QuoteFormProvider";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER, btn, btnGhost } from "../tokens";
import BackButton from "../shared/BackButton";
import ProgressDots from "../shared/ProgressDots";
import MeasuringTool from "../shared/MeasuringTool";
import EstimateBar from "../shared/EstimateBar";

const PORTFOLIO_SIZES = ["1", "2–5", "6–10", "10+"];
const PROPERTY_TYPES  = ["Flat", "House", "HMO", "Mixed"];
const FLOOR_CONDITIONS = [
  { id: "good",    label: "Good — just replacing" },
  { id: "poor",    label: "Poor — may need prep work" },
  { id: "unknown", label: "Unknown" },
];
const PRIORITIES = [
  { id: "durability", label: "Durability first",  desc: "Long-lasting materials, lower maintenance costs" },
  { id: "cost",       label: "Cost first",         desc: "Best value spec, minimise outlay" },
  { id: "speed",      label: "Speed first",        desc: "Fastest turnaround, minimal disruption" },
  { id: "all",        label: "All three",          desc: "Balanced recommendation across all factors" },
];
const ROOM_LIST = ["Living Room", "Bedroom", "Hallway", "Kitchen", "Bathroom", "Landing", "Stairs", "Dining Room"];

function OptionCard({ label, desc, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? GOLD_DIM : SURFACE, border: `1px solid ${active ? GOLD : BORDER}`,
      borderRadius: 12, padding: "18px 22px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", marginBottom: 10,
    }}>
      <div style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 15, marginBottom: desc ? 4 : 0 }}>{label}</div>
      {desc && <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 13 }}>{desc}</div>}
    </button>
  );
}

function FloRecStep({ onBack, onSubmit, portfolioSize }) {
  const { state, dispatch } = useQuoteForm();
  const { rooms, floRecommendations } = state.landlord;
  const [loading, setLoading] = useState(!floRecommendations);
  const [error, setError]     = useState(null);
  const isLarge = ["6–10", "10+"].includes(portfolioSize);

  useEffect(() => {
    if (floRecommendations) { setLoading(false); return; }
    const roomData = Object.entries(rooms).map(([name, r]) => ({
      room: name, flooringType: r.flooringType,
      practicalFlags: r.practicalFlags, area: r.dimensions?.area,
    }));
    fetch("/api/flo/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ laneType: "landlord", roomData, context: { priority: state.landlord.priority, floorCondition: state.landlord.floorCondition } }),
    })
      .then((r) => r.json())
      .then((d) => { dispatch({ type: "LL_SET_FLO", payload: d.rooms ?? [] }); setLoading(false); })
      .catch(() => { setError("Flo couldn't connect — you can still proceed."); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0" }}><BackButton onClick={onBack} /></div>
      <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "28px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3" stroke={GOLD} strokeWidth="1.3"/>
              <path d="M2.5 15.5C2.5 12 5.5 10 9 10C12.5 10 15.5 12 15.5 15.5" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ color: GOLD, fontFamily: "var(--font-outfit)", fontSize: 12, fontWeight: 600 }}>Flo</div>
        </div>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(22px,4vw,34px)", color: TEXT, margin: "0 0 28px" }}>
          Spec recommendation for your portfolio
        </h2>

        {loading && (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <div style={{ color: GOLD, fontFamily: "var(--font-outfit)", fontSize: 13 }}>Flo is putting together your spec…</div>
          </div>
        )}
        {error && <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 13, marginBottom: 20 }}>{error}</div>}

        {floRecommendations && floRecommendations.map((rec, i) => (
          <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 22px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{rec.room}</span>
              <span style={{ background: GOLD_DIM, color: GOLD, border: `1px solid ${GOLD_BORDER}`, borderRadius: 20, padding: "3px 10px", fontFamily: "var(--font-outfit)", fontSize: 11, fontWeight: 600 }}>{rec.recommended_tier}</span>
            </div>
            <p style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{rec.reason}</p>
          </div>
        ))}

        {(floRecommendations || error) && (
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => onSubmit("quote")} style={{ ...btn, padding: "16px", fontSize: 16, width: "100%" }}>
              Get a full quote →
            </button>
            {isLarge && (
              <button onClick={() => onSubmit("portfolio")} style={{ ...btnGhost, padding: "15px", fontSize: 14, width: "100%" }}>
                Talk to us about your portfolio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandlordFlow({ onBackToLanes }) {
  const { state, dispatch } = useQuoteForm();
  const { step } = state;
  const ll = state.landlord;
  const [currentRoom, setCurrentRoom] = useState(0);
  const estimate = computeEstimate(ll.rooms);

  const goStep = (s) => dispatch({ type: "SET_STEP", payload: s });
  const update = (payload) => dispatch({ type: "LL_UPDATE", payload });

  // Step 0: portfolio + property type
  // Step 1: rooms + measures + floor condition
  // Step 2: priority
  // Step 3: Flo recommendation

  const handleRoomSelect = (id) => {
    const next = ll.selectedRooms.includes(id)
      ? ll.selectedRooms.filter((r) => r !== id)
      : [...ll.selectedRooms, id];
    dispatch({ type: "LL_SET_ROOMS", payload: next });
  };

  const handleSubmit = async (action) => {
    const ref = `STR-${Date.now().toString(36).toUpperCase()}`;
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_number: ref,
        customer_type: "landlord",
        lane_flag: ["6–10","10+"].includes(ll.portfolioSize) ? "high" : "standard",
        portfolio_size: ll.portfolioSize,
        property_type: ll.propertyType,
        rooms: ll.selectedRooms.join(", "),
        floor_condition: ll.floorCondition,
        priority_selection: ll.priority,
        total_m2: Object.values(ll.rooms).reduce((s,r) => s + (r.dimensions?.area ?? 0), 0).toFixed(2),
        action,
        status: "New",
      }),
    });
    goStep(99);
  };

  if (step === 99) return <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 32, textAlign: "center" }}>
    <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: 36, color: "#f2ede0", margin: "0 0 12px" }}>We're on it</h2>
    <p style={{ fontFamily: "var(--font-outfit)", fontSize: 15, color: "rgba(242,237,224,0.5)", maxWidth: 360, lineHeight: 1.7, margin: 0 }}>We'll be in touch shortly with your full quote.</p>
  </div>;

  // ── Step 0: Portfolio ────────────────────────────────────────────
  if (step === 0) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={onBackToLanes} />
        <ProgressDots total={4} current={0} />
        <div style={{ width: 52 }} />
      </div>
      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(26px,5vw,40px)", color: TEXT, margin: "0 0 8px" }}>Your portfolio</h2>
        <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 32px" }}>How many properties are involved?</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 32 }}>
          {PORTFOLIO_SIZES.map((s) => (
            <button key={s} onClick={() => update({ portfolioSize: s })} style={{
              background: ll.portfolioSize === s ? GOLD_DIM : SURFACE,
              border: `1px solid ${ll.portfolioSize === s ? GOLD : BORDER}`,
              borderRadius: 12, padding: "20px 16px", cursor: "pointer",
              color: ll.portfolioSize === s ? TEXT : MUTED,
              fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 18, transition: "all 0.2s",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Property type</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
          {PROPERTY_TYPES.map((t) => (
            <button key={t} onClick={() => update({ propertyType: t })} style={{
              background: ll.propertyType === t ? GOLD_DIM : SURFACE,
              border: `1px solid ${ll.propertyType === t ? GOLD : BORDER}`,
              borderRadius: 8, padding: "10px 18px", cursor: "pointer",
              color: ll.propertyType === t ? TEXT : MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>
        <button onClick={() => goStep(1)} disabled={!ll.portfolioSize || !ll.propertyType} style={{ ...btn, width: "100%", padding: "16px", fontSize: 16, opacity: ll.portfolioSize && ll.propertyType ? 1 : 0.35 }}>
          Continue →
        </button>
      </div>
    </div>
  );

  // ── Step 1: Rooms + floor condition ─────────────────────────────
  if (step === 1) {
    const roomName = ll.selectedRooms[currentRoom];
    const showRoomConfig = ll.selectedRooms.length > 0 && currentRoom < ll.selectedRooms.length;

    return (
      <>
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
          <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <BackButton onClick={() => { if (showRoomConfig && currentRoom > 0) setCurrentRoom(c=>c-1); else if (showRoomConfig) setCurrentRoom(-1); else goStep(0); }} />
            <ProgressDots total={4} current={1} />
            <div style={{ width: 52 }} />
          </div>
          <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
            {!showRoomConfig || currentRoom < 0 ? (
              <>
                <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(26px,5vw,40px)", color: TEXT, margin: "0 0 8px" }}>Which rooms?</h2>
                <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 24px" }}>Select all that need flooring.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }}>
                  {ROOM_LIST.map((r) => {
                    const active = ll.selectedRooms.includes(r);
                    return (
                      <button key={r} onClick={() => handleRoomSelect(r)} style={{
                        background: active ? GOLD_DIM : SURFACE, border: `1px solid ${active ? GOLD : BORDER}`,
                        borderRadius: 10, padding: "16px 18px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                        color: active ? TEXT : MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, fontWeight: active ? 600 : 400,
                      }}>{r}</button>
                    );
                  })}
                </div>
                <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Existing floor condition</div>
                {FLOOR_CONDITIONS.map((c) => (
                  <OptionCard key={c.id} label={c.label} active={ll.floorCondition === c.id} onClick={() => update({ floorCondition: c.id })} />
                ))}
                <button onClick={() => { setCurrentRoom(0); }} disabled={ll.selectedRooms.length === 0 || !ll.floorCondition} style={{ ...btn, width: "100%", padding: "16px", fontSize: 16, marginTop: 20, opacity: ll.selectedRooms.length > 0 && ll.floorCondition ? 1 : 0.35 }}>
                  Measure rooms →
                </button>
              </>
            ) : (
              <>
                <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  Room {currentRoom + 1} of {ll.selectedRooms.length} — {roomName}
                </div>
                <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 24px" }}>How big is this room?</h2>
                <MeasuringTool
                  roomName={roomName}
                  value={ll.rooms[roomName]?.dimensions}
                  onChange={(dims) => dispatch({ type: "LL_UPDATE_ROOM", payload: { roomName, updates: { dimensions: dims } } })}
                />
                <button
                  onClick={() => {
                    if (currentRoom < ll.selectedRooms.length - 1) setCurrentRoom(c=>c+1);
                    else goStep(2);
                  }}
                  style={{ ...btn, width: "100%", padding: "16px", fontSize: 16, marginTop: 28 }}
                >
                  {currentRoom < ll.selectedRooms.length - 1 ? "Next room →" : "Continue →"}
                </button>
              </>
            )}
          </div>
        </div>
        <EstimateBar estimate={estimate} />
      </>
    );
  }

  // ── Step 2: Priority ──────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={() => goStep(1)} />
        <ProgressDots total={4} current={2} />
        <div style={{ width: 52 }} />
      </div>
      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(26px,5vw,40px)", color: TEXT, margin: "0 0 8px" }}>What matters most?</h2>
        <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 28px" }}>This shapes the spec Flo recommends.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {PRIORITIES.map((p) => (
            <OptionCard key={p.id} label={p.label} desc={p.desc} active={ll.priority === p.id} onClick={() => update({ priority: p.id })} />
          ))}
        </div>
        <button onClick={() => goStep(3)} disabled={!ll.priority} style={{ ...btn, width: "100%", padding: "16px", fontSize: 16, opacity: ll.priority ? 1 : 0.35 }}>
          See Flo's recommendation →
        </button>
      </div>
    </div>
  );

  // ── Step 3: Flo ───────────────────────────────────────────────────
  if (step === 3) return (
    <>
      <FloRecStep onBack={() => goStep(2)} onSubmit={handleSubmit} portfolioSize={ll.portfolioSize} />
      <EstimateBar estimate={estimate} />
    </>
  );

  return null;
}
