"use client";
import { useState } from "react";
import { useQuoteForm } from "../QuoteFormProvider";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER, btn, btnGhost } from "../tokens";
import BackButton from "../shared/BackButton";
import MeasuringTool from "../shared/MeasuringTool";
import DesignPicker from "./DesignPicker";

const FLOORING_TYPES = [
  { id: "Carpet",   img: "/quote-carpet.png" },
  { id: "LVT",      img: "/quote-lvt.png" },
  { id: "Laminate", img: "/quote-laminate.png" },
  { id: "Vinyl",    img: "/quote-vinyl.webp" },
];

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

const PRACTICAL_FLAGS = [
  { id: "pets_children",  label: "Pets or children in this room" },
  { id: "high_footfall",  label: "High footfall or heavy use" },
  { id: "ufh",            label: "Underfloor heating present" },
  { id: "rental",         label: "Rental or investment property" },
  { id: "bare_feet",      label: "Bare feet comfort is a priority" },
];

const STAIRS_TYPES = [
  { id: "wall-to-wall", label: "Full stair carpet", desc: "Wall to wall coverage" },
  { id: "runner",       label: "Stair runner",      desc: "Central strip, wood visible either side" },
  { id: "landing-only", label: "Landing only",      desc: "Landing carpet, no stairs" },
];

const RUNNER_FAMILIES = [
  { family: "Plain & Textural", options: ["Herringbone Weave", "Flat Ribbed", "Boucle"] },
  { family: "Striped",          options: ["Classic Stripe", "Wide Stripe", "Multi Stripe"] },
  { family: "Patterned",        options: ["Geometric", "Floral", "Tartan"] },
];

const SUB_STEPS = ["flooring", "mood", "flags", "measure", "design"];

export default function RoomConfig({ roomName, roomIndex, totalRooms, onBack, onNext }) {
  const { state, dispatch } = useQuoteForm();
  const room = state.homeowner.rooms[roomName] ?? {};
  const [subStep, setSubStep] = useState(0);

  const isStairs = roomName === "Stairs";
  const steps = isStairs ? [...SUB_STEPS, "stairs"] : SUB_STEPS;

  const update = (updates) =>
    dispatch({ type: "HO_UPDATE_ROOM", payload: { roomName, updates } });

  const goBack = () => {
    if (subStep > 0) setSubStep(subStep - 1);
    else onBack();
  };

  const goNext = () => {
    if (subStep < steps.length - 1) setSubStep(subStep + 1);
    else onNext();
  };

  const currentStep = steps[subStep];
  const isSkipSurvey = room.dimensions?.skipToSurvey;

  // Validation per sub-step
  const canAdvance = (() => {
    if (currentStep === "flooring") return !!room.flooringType;
    if (currentStep === "mood")    return !!room.mood;
    if (currentStep === "flags")   return true; // optional
    if (currentStep === "measure") return !!(room.dimensions?.area > 0 || isSkipSurvey);
    if (currentStep === "design")  return !!(room.design);
    if (currentStep === "stairs")  return !!(room.stairsType);
    return true;
  })();

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={goBack} />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: GOLD, fontFamily: "var(--font-outfit)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Room {roomIndex + 1} of {totalRooms}
          </div>
          {/* Sub-step dots */}
          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === subStep ? 16 : 5, height: 5, borderRadius: 2.5, background: i === subStep ? GOLD : i < subStep ? "rgba(201,169,110,0.4)" : "rgba(42,42,40,1)", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "28px 24px 24px" }}>
        {/* Room name */}
        <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          {roomName}
        </div>

        {/* ── Flooring Type ── */}
        {currentStep === "flooring" && (
          <>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 28px", lineHeight: 1.2 }}>
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
                      <span style={{ color: active ? TEXT : MUTED, fontFamily: "var(--font-outfit)", fontWeight: active ? 600 : 400, fontSize: 14 }}>{ft.id}</span>
                      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Mood ── */}
        {currentStep === "mood" && (
          <>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
              What's the feel you're after?
            </h2>
            <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 28px" }}>
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
                    <div style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                      {mood.label}
                    </div>
                    <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 13 }}>
                      {mood.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Practical Flags ── */}
        {currentStep === "flags" && (
          <>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
              Anything we should know?
            </h2>
            <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 28px" }}>
              Select all that apply. Helps Flo give you the right spec.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PRACTICAL_FLAGS.map((flag) => {
                const active = (room.practicalFlags ?? []).includes(flag.id);
                return (
                  <button
                    key={flag.id}
                    onClick={() => {
                      const flags = room.practicalFlags ?? [];
                      update({ practicalFlags: active ? flags.filter((f) => f !== flag.id) : [...flags, flag.id] });
                    }}
                    style={{
                      background: active ? GOLD_DIM : SURFACE,
                      border: `1px solid ${active ? GOLD : BORDER}`,
                      borderRadius: 10,
                      padding: "16px 20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      transition: "all 0.2s",
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: `1.5px solid ${active ? GOLD : BORDER}`,
                      background: active ? GOLD : "transparent",
                      flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#111110" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ color: active ? TEXT : MUTED, fontFamily: "var(--font-outfit)", fontSize: 14 }}>
                      {flag.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Measuring ── */}
        {currentStep === "measure" && (
          <>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
              How big is the room?
            </h2>
            <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 28px" }}>
              We'll add 10% for wastage automatically.
            </p>
            <MeasuringTool
              roomName={roomName}
              value={room.dimensions}
              onChange={(dims) => update({ dimensions: dims })}
            />
          </>
        )}

        {/* ── Design & Colour ── */}
        {currentStep === "design" && (
          <>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
              Any preference on the look?
            </h2>
            <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 24px" }}>
              Your surveyor will bring physical samples. This just guides Flo.
            </p>
            <DesignPicker
              flooringType={room.flooringType}
              value={{ design: room.design, colour: room.colour }}
              onChange={({ design, colour }) => update({ design, colour })}
            />
          </>
        )}

        {/* ── Stairs ── */}
        {currentStep === "stairs" && (
          <>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 28px", lineHeight: 1.2 }}>
              How would you like the stairs done?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {STAIRS_TYPES.map((st) => {
                const active = room.stairsType === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => update({ stairsType: st.id, runnerStyle: null })}
                    style={{
                      background: active ? GOLD_DIM : SURFACE,
                      border: `1px solid ${active ? GOLD : BORDER}`,
                      borderRadius: 12,
                      padding: "20px 24px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{st.label}</div>
                    <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 13 }}>{st.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Runner style selector */}
            {room.stairsType === "runner" && (
              <div>
                <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                  Runner style
                </div>
                {RUNNER_FAMILIES.map((family) => (
                  <div key={family.family} style={{ marginBottom: 20 }}>
                    <div style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                      {family.family}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {family.options.map((opt) => {
                        const active = room.runnerStyle === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => update({ runnerStyle: opt })}
                            style={{
                              background: active ? GOLD_DIM : SURFACE,
                              border: `1px solid ${active ? GOLD : BORDER}`,
                              borderRadius: 8,
                              padding: "10px 14px",
                              cursor: "pointer",
                              color: active ? TEXT : MUTED,
                              fontFamily: "var(--font-outfit)",
                              fontSize: 12,
                              fontWeight: active ? 600 : 400,
                              transition: "all 0.15s",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div style={{ marginTop: 36 }}>
          <button
            onClick={goNext}
            disabled={!canAdvance}
            style={{
              ...btn,
              width: "100%",
              padding: "16px",
              fontSize: 16,
              opacity: canAdvance ? 1 : 0.35,
              cursor: canAdvance ? "pointer" : "default",
            }}
          >
            {subStep < steps.length - 1 ? "Continue →" : subStep === steps.length - 1 && roomIndex < totalRooms - 1 ? `Next: configure ${state.homeowner.selectedRooms[roomIndex + 1]} →` : "See Flo's recommendation →"}
          </button>
        </div>
      </div>
    </div>
  );
}
