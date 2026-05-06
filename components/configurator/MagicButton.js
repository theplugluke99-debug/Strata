"use client";

import { brand } from "../../lib/brand";

export default function MagicButton({ children, disabled, onClick }) {
  return (
    <button className="magic-button" disabled={disabled} onClick={onClick}>
      <span>{children}</span>
      <i>→</i>
      <style>{`
        .magic-button {
          width: 100%;
          min-height: 58px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #d8b16f, ${brand.gold});
          color: ${brand.bg};
          font-family: ${brand.sans};
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 18px 52px rgba(201,169,110,0.18);
          transition: transform 0.2s cubic-bezier(.2,.8,.2,1), opacity 0.2s;
        }
        .magic-button:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        .magic-button:not(:disabled):active {
          transform: scale(0.975);
        }
        .magic-button:not(:disabled):after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          transform: translateX(-120%);
        }
        .magic-button:not(:disabled):active:after {
          animation: buttonShimmer 0.52s ease-out;
        }
        .magic-button i {
          font-size: 22px;
          font-style: normal;
          line-height: 1;
        }
        @keyframes buttonShimmer {
          to { transform: translateX(120%); }
        }
      `}</style>
    </button>
  );
}
