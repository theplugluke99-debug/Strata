"use client";
import { SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER } from "../tokens";

export default function Chip({ label, selected, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? GOLD_DIM : SURFACE,
        border: `1px solid ${selected ? GOLD : BORDER}`,
        borderRadius: 20,
        padding: "8px 16px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: selected ? TEXT : MUTED,
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {label}
    </button>
  );
}
