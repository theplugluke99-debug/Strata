"use client";
import { BORDER, GOLD } from "../tokens";

export default function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === current ? GOLD : i < current ? "rgba(201,169,110,0.4)" : BORDER,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
