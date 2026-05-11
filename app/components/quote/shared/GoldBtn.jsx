"use client";
import { btn, MUTED } from "../tokens";

export default function GoldBtn({ children, onClick, disabled, fullWidth, helperText }) {
  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...btn,
          width: fullWidth ? "100%" : "auto",
          padding: "16px",
          fontSize: 16,
          fontFamily: "system-ui, sans-serif",
          opacity: disabled ? 0.35 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {children}
      </button>
      {helperText && (
        <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13, textAlign: "center", margin: "10px 0 0" }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
