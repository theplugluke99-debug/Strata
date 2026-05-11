"use client";
import { TEXT, MUTED } from "../../tokens";
import MeasuringTool from "../../shared/MeasuringTool";

export default function DimensionsStep({ roomName, room, dispatch }) {
  const update = (updates) =>
    dispatch({ type: "HO_UPDATE_ROOM", payload: { roomName, updates } });

  return (
    <>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
        How big is the room?
      </h2>
      <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 14, margin: "0 0 28px" }}>
        We'll add 10% for wastage automatically.
      </p>
      <MeasuringTool
        roomName={roomName}
        value={room.dimensions}
        onChange={(dims) => update({ dimensions: dims })}
      />
    </>
  );
}
