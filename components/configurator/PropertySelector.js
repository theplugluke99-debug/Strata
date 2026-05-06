import { brand } from "../../lib/brand";

const options = [
  {
    type: "Residential",
    title: "Residential",
    text: "Rooms, stairs and the everyday flow of home.",
  },
  {
    type: "Commercial",
    title: "Commercial",
    text: "Workspaces, hospitality and areas with heavier use.",
  },
];

export default function PropertySelector({ selected, onSelect }) {
  return (
    <div className="property-grid">
      {options.map(option => (
        <button
          key={option.type}
          className={`property-card ${selected === option.type ? "selected" : ""}`}
          onClick={() => onSelect(option.type)}
        >
          <span className="icon">{option.type === "Residential" ? "⌂" : "□"}</span>
          <strong>{option.title}</strong>
          <small>{option.text}</small>
        </button>
      ))}
      <style>{`
        .property-grid {
          display: grid;
          gap: 12px;
        }
        .property-card {
          min-height: 176px;
          border: 1px solid ${brand.border};
          border-radius: 18px;
          background: linear-gradient(145deg, rgba(26,26,24,0.9), rgba(17,17,16,0.92));
          color: ${brand.text};
          padding: 20px;
          text-align: left;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.24);
          transition: transform 0.24s cubic-bezier(.2,.9,.2,1), border-color 0.2s, background 0.2s;
        }
        .property-card:active {
          transform: scale(0.98);
        }
        .property-card.selected {
          transform: scale(1.02);
          border-color: ${brand.gold};
          background: linear-gradient(145deg, rgba(201,169,110,0.15), rgba(26,26,24,0.92));
        }
        .property-card.selected:after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: propertyShimmer 0.65s ease-out;
        }
        .icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(201,169,110,0.35);
          border-radius: 999px;
          color: ${brand.gold};
          font-size: 24px;
          margin-bottom: 26px;
        }
        .property-card strong {
          display: block;
          font-family: ${brand.serif};
          font-size: 30px;
          font-weight: 600;
          line-height: 1;
        }
        .property-card small {
          display: block;
          margin-top: 10px;
          color: ${brand.dim};
          font-size: 13px;
          line-height: 1.55;
          max-width: 280px;
        }
        @keyframes propertyShimmer {
          from { transform: translateX(-115%); }
          to { transform: translateX(115%); }
        }
        @media (min-width: 760px) {
          .property-grid {
            grid-template-columns: 1fr 1fr;
            max-width: 760px;
            margin: 0 auto;
            width: 100%;
          }
          .property-card { min-height: 230px; padding: 28px; }
        }
      `}</style>
    </div>
  );
}
