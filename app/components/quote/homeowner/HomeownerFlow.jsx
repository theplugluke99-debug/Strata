"use client";
import { useEffect } from "react";
import { useQuoteForm, computeEstimate } from "../QuoteFormProvider";
import RoomSelector from "./RoomSelector";
import RoomConfig from "./RoomConfig";
import FloRecommendation from "./FloRecommendation";
import EstimateBar from "../shared/EstimateBar";

export default function HomeownerFlow({ onBackToLanes }) {
  const { state, dispatch } = useQuoteForm();
  const { step } = state;
  const { selectedRooms, currentRoomIndex, rooms } = state.homeowner;

  const estimate = computeEstimate(rooms);

  // Update global estimate live
  useEffect(() => {
    dispatch({ type: "SET_ESTIMATE", payload: estimate });
  }, [JSON.stringify(rooms)]);

  // step 0 = room selector
  // step 1 = room config loop
  // step 2 = flo recommendation

  const goToStep = (s) => dispatch({ type: "SET_STEP", payload: s });

  // Room config navigation
  const handleRoomBack = () => {
    if (currentRoomIndex > 0) {
      dispatch({ type: "HO_SET_CURRENT_ROOM", payload: currentRoomIndex - 1 });
    } else {
      goToStep(0);
    }
  };

  const handleRoomNext = () => {
    if (currentRoomIndex < selectedRooms.length - 1) {
      dispatch({ type: "HO_SET_CURRENT_ROOM", payload: currentRoomIndex + 1 });
    } else {
      goToStep(2);
    }
  };

  const handleSubmit = async (action) => {
    const roomSummary = Object.entries(rooms).map(([name, r]) => ({
      room: name,
      flooringType: r.flooringType,
      mood: r.mood,
      design: r.design,
      colour: r.colour,
      practicalFlags: r.practicalFlags,
      area: r.dimensions?.area,
      skipToSurvey: r.dimensions?.skipToSurvey,
      stairsType: r.stairsType,
      runnerStyle: r.runnerStyle,
    }));

    const ref = `STR-${Date.now().toString(36).toUpperCase()}`;

    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_number: ref,
        customer_type: "homeowner",
        lane_flag: "standard",
        rooms: selectedRooms.join(", "),
        room_data: JSON.stringify(roomSummary),
        total_m2: Object.values(rooms).reduce((s, r) => s + (r.dimensions?.area ?? 0), 0).toFixed(2),
        mood_selections: JSON.stringify(Object.fromEntries(Object.entries(rooms).map(([n, r]) => [n, r.mood]))),
        practical_flags: JSON.stringify(Object.fromEntries(Object.entries(rooms).map(([n, r]) => [n, r.practicalFlags]))),
        action,
        status: "New",
      }),
    });

    // Show confirmation
    dispatch({ type: "SET_STEP", payload: 99 });
  };

  if (step === 99) {
    return <ConfirmationScreen />;
  }

  if (step === 0) {
    return (
      <>
        <RoomSelector onBack={onBackToLanes} onNext={() => { dispatch({ type: "HO_SET_CURRENT_ROOM", payload: 0 }); goToStep(1); }} />
        <EstimateBar estimate={estimate} />
      </>
    );
  }

  if (step === 1 && selectedRooms.length > 0) {
    const roomName = selectedRooms[currentRoomIndex];
    return (
      <>
        <RoomConfig
          key={roomName}
          roomName={roomName}
          roomIndex={currentRoomIndex}
          totalRooms={selectedRooms.length}
          onBack={handleRoomBack}
          onNext={handleRoomNext}
        />
        <EstimateBar estimate={estimate} />
      </>
    );
  }

  if (step === 2) {
    return (
      <FloRecommendation
        onBack={() => { dispatch({ type: "HO_SET_CURRENT_ROOM", payload: selectedRooms.length - 1 }); goToStep(1); }}
        onSubmit={handleSubmit}
      />
    );
  }

  return null;
}

function ConfirmationScreen() {
  const { setCustomerType } = useQuoteForm();
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(138,170,136,0.15)", border: "1px solid rgba(138,170,136,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L9.5 16.5L19 7" stroke="#8aaa88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: 36, color: "#f2ede0", margin: "0 0 12px" }}>
        We're on it
      </h2>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, color: "rgba(242,237,224,0.5)", maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
        We'll be in touch shortly to arrange next steps. Keep an eye on your phone.
      </p>
    </div>
  );
}
