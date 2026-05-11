"use client";
import { GOLD } from "../tokens";

export default function SectionLabel({ children }) {
  return (
    <div style={{
      color: GOLD,
      fontFamily: "system-ui, sans-serif",
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}
