"use client";
import { useState } from "react";
import { useQuoteForm } from "../QuoteFormProvider";
import { MUTED, GOLD, btn } from "../tokens";
import BackButton from "../shared/BackButton";
import FlooringTypeStep from "./steps/FlooringTypeStep";
import GradeStep       from "./steps/GradeStep";
import CurrentFloorStep from "./steps/CurrentFloorStep";
import DimensionsStep  from "./steps/DimensionsStep";
import DesignStep      from "./steps/DesignStep";
import StairsStep      from "./steps/StairsStep";

const SUB_STEPS = ["flooring", "mood", "flags", "measure", "design"];

export default function RoomConfig({ roomName, roomIndex, totalRooms, onBack, onNext }) {
  const { state, dispatch } = useQuoteForm();
  const room = state.homeowner.rooms[roomName] ?? {};
  const [subStep, setSubStep] = useState(0);

  const isStairs = roomName === "Stairs";
  const steps = isStairs ? [...SUB_STEPS, "stairs"] : SUB_STEPS;

  const goBack = () => { if (subStep > 0) setSubStep(subStep - 1); else onBack(); };
  const goNext = () => { if (subStep < steps.length - 1) setSubStep(subStep + 1); else onNext(); };

  const currentStep = steps[subStep];
  const isSkipSurvey = room.dimensions?.skipToSurvey;

  const canAdvance = (() => {
    if (currentStep === "flooring") return !!room.flooringType;
    if (currentStep === "mood")    return !!room.mood;
    if (currentStep === "flags")   return true;
    if (currentStep === "measure") return !!(room.dimensions?.area > 0 || isSkipSurvey);
    if (currentStep === "design")  return !!(room.design && room.colour);
    if (currentStep === "stairs")  return !!(room.stairsType);
    return true;
  })();

  const helperText = canAdvance ? null : (() => {
    if (currentStep === "flooring") return "Choose a flooring type to continue";
    if (currentStep === "mood")    return "Pick a mood so Flo can tailor the recommendation";
    if (currentStep === "measure") return "Enter room dimensions, or skip to survey";
    if (currentStep === "design")  return room.design ? "Pick a colour preference to continue" : "Select a design style to continue";
    if (currentStep === "stairs")  return "Choose how you'd like the stairs done";
    return null;
  })();

  const stepProps = { roomName, room, dispatch };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={goBack} />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: GOLD, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Room {roomIndex + 1} of {totalRooms}
          </div>
          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === subStep ? 16 : 5, height: 5, borderRadius: 2.5, background: i === subStep ? GOLD : i < subStep ? "rgba(201,169,110,0.4)" : "rgba(42,42,40,1)", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "28px 24px 24px" }}>
        <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          {roomName}
        </div>

        {currentStep === "flooring" && <FlooringTypeStep {...stepProps} />}
        {currentStep === "mood"     && <GradeStep        {...stepProps} />}
        {currentStep === "flags"    && <CurrentFloorStep  {...stepProps} />}
        {currentStep === "measure"  && <DimensionsStep    {...stepProps} />}
        {currentStep === "design"   && <DesignStep        {...stepProps} />}
        {currentStep === "stairs"   && <StairsStep        {...stepProps} />}

        <div style={{ marginTop: 36 }}>
          <button
            onClick={goNext}
            disabled={!canAdvance}
            style={{
              ...btn,
              width: "100%",
              padding: "16px",
              fontSize: 16,
              fontFamily: "system-ui, sans-serif",
              opacity: canAdvance ? 1 : 0.35,
              cursor: canAdvance ? "pointer" : "default",
            }}
          >
            {subStep < steps.length - 1 ? "Continue →" : roomIndex < totalRooms - 1 ? `Next: configure ${state.homeowner.selectedRooms[roomIndex + 1]} →` : "See Flo's recommendation →"}
          </button>
          {helperText && (
            <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13, textAlign: "center", margin: "10px 0 0" }}>
              {helperText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
