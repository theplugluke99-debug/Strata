"use client";
import { TEXT, MUTED } from "../../tokens";
import DesignPicker from "../DesignPicker";

export default function DesignStep({ roomName, room, dispatch }) {
  const update = (updates) =>
    dispatch({ type: "HO_UPDATE_ROOM", payload: { roomName, updates } });

  return (
    <>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2 }}>
        Any preference on the look?
      </h2>
      <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 14, margin: "0 0 24px" }}>
        Your surveyor will bring physical samples. This just guides Flo.
      </p>
      <DesignPicker
        flooringType={room.flooringType}
        value={{ design: room.design, colour: room.colour }}
        onChange={({ design, colour }) => update({ design, colour })}
      />
    </>
  );
}
