import { brand } from "../../lib/brand";
import MagicChip from "./MagicChip";

export default function RoomSelector({ label, options, selected, onToggle, bedroomCount, onBedroomCountChange }) {
  return (
    <section className="room-selector" aria-label={label}>
      <div className="selection-row">
        <span>{label}</span>
        <strong>{selected.length || "None yet"}</strong>
      </div>
      <div className="chip-grid">
        {options.map(option => (
          <MagicChip key={option} selected={selected.includes(option)} onClick={() => onToggle(option)}>
            {option}
          </MagicChip>
        ))}
      </div>
      {typeof bedroomCount === "number" && selected.includes("Bedroom") && (
        <div className="bedroom-scale" aria-label="Number of bedrooms">
          <span>Bedrooms</span>
          <div>
            <button onClick={() => onBedroomCountChange?.(bedroomCount - 1)} disabled={bedroomCount <= 1}>−</button>
            <strong>{bedroomCount}</strong>
            <button onClick={() => onBedroomCountChange?.(bedroomCount + 1)} disabled={bedroomCount >= 5}>+</button>
          </div>
        </div>
      )}
      <style>{`
        .room-selector {
          display: grid;
          gap: 12px;
        }
        .selection-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: ${brand.gold};
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .selection-row strong {
          color: ${brand.text};
          font-size: 11px;
          letter-spacing: 0.08em;
        }
        .chip-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }
        .bedroom-scale {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border: 1px solid rgba(201,169,110,0.18);
          background: rgba(26,26,24,0.7);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .bedroom-scale span {
          color: ${brand.gold};
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .bedroom-scale div {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bedroom-scale button {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(201,169,110,0.32);
          background: transparent;
          color: ${brand.text};
          font-size: 18px;
          cursor: pointer;
        }
        .bedroom-scale button:disabled {
          opacity: 0.28;
          cursor: not-allowed;
        }
        .bedroom-scale strong {
          color: ${brand.text};
          font-family: ${brand.serif};
          font-size: 28px;
          min-width: 22px;
          text-align: center;
        }
        @media (min-width: 760px) {
          .chip-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}
