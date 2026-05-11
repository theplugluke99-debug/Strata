"use client";
import { MUTED, TEXT } from "../tokens";

export default function BackButton({ onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: MUTED,
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        padding: "8px 0",
        transition: "color 0.15s ease",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
      onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Back
    </button>
  );
}
