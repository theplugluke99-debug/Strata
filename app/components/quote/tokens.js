export const BG       = "#111110";
export const SURFACE  = "#1a1a18";
export const SURFACE2 = "#222220";
export const BORDER   = "#2a2a28";
export const TEXT     = "#f2ede0";
export const MUTED    = "rgba(242,237,224,0.45)";
export const GOLD     = "#c9a96e";
export const GOLD_DIM = "rgba(201,169,110,0.15)";
export const GOLD_BORDER = "rgba(201,169,110,0.4)";

export const cardBase = {
  background: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

export const cardActive = {
  ...cardBase,
  border: `1px solid ${GOLD}`,
  background: GOLD_DIM,
};

export const btn = {
  background: GOLD,
  color: "#111110",
  border: "none",
  borderRadius: 8,
  fontFamily: "var(--font-outfit)",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  transition: "opacity 0.15s ease",
  padding: "14px 28px",
};

export const btnGhost = {
  background: "transparent",
  color: TEXT,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  fontFamily: "var(--font-outfit)",
  fontWeight: 500,
  fontSize: 15,
  cursor: "pointer",
  transition: "all 0.15s ease",
  padding: "14px 28px",
};
