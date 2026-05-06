"use client";

import { brand } from "../../lib/brand";

export default function MagicChip({ children, selected, onClick }) {
  return (
    <button className={`magic-chip ${selected ? "selected" : ""}`} onClick={onClick}>
      <span>{children}</span>
      {selected && <i>✓</i>}
      <style>{`
        .magic-chip {
          min-height: 48px;
          border: 1px solid ${brand.border};
          border-radius: 10px;
          background: rgba(26,26,24,0.72);
          color: ${brand.dim};
          font-family: ${brand.sans};
          font-size: 13px;
          line-height: 1.2;
          text-align: left;
          padding: 11px 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transform: scale(1);
          transition: transform 0.22s cubic-bezier(.2,.9,.2,1), border-color 0.22s, background 0.22s, color 0.22s;
        }
        .magic-chip:active {
          transform: scale(0.98);
        }
        .magic-chip.selected {
          transform: scale(1.02);
          background: ${brand.gold};
          border-color: ${brand.gold};
          color: ${brand.bg};
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(201,169,110,0.12);
        }
        .magic-chip.selected:after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent);
          animation: chipShimmer 0.58s ease-out;
        }
        .magic-chip i {
          position: relative;
          z-index: 1;
          font-style: normal;
          font-size: 11px;
        }
        .magic-chip span {
          position: relative;
          z-index: 1;
        }
        @keyframes chipShimmer {
          from { transform: translateX(-110%); }
          to { transform: translateX(110%); }
        }
      `}</style>
    </button>
  );
}
