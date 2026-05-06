import { brand } from "../../lib/brand";

const areaAliases = {
  "Office Space": "main",
  "Retail Floor": "retail",
  Showroom: "retail",
  "Restaurant / Café": "retail",
  "Hotel Room": "meeting",
  "Staff Room": "service",
  "Bathroom / WC": "service",
  Reception: "reception",
  "Meeting Room": "meeting",
  "Corridor / Hallway": "corridor",
};

const groundAreas = [
  { key: "reception", label: "Reception", points: "60,220 228,156 320,255 150,330", texture: "commercial-lvt" },
  { key: "main", label: "Open plan", points: "228,156 540,82 684,240 372,332 320,255", texture: "commercial-carpet-tile" },
  { key: "corridor", label: "Circulation", points: "150,330 320,255 512,430 322,498", texture: "commercial-safety" },
  { key: "retail", label: "Main floor", points: "372,332 684,240 750,318 512,430", texture: "commercial-rubber" },
];

const upperAreas = [
  { key: "meeting", label: "Meeting suite", points: "330,138 520,92 654,238 462,292", texture: "commercial-broadloom" },
  { key: "service", label: "Service core", points: "520,92 660,130 742,222 654,238", texture: "commercial-safety" },
];

function selectedKeys(selectedAreas) {
  return new Set(selectedAreas.map(area => areaAliases[area]).filter(Boolean));
}

export default function CommercialVisualiser({ selectedAreas, assemblyStage = 2 }) {
  const selected = selectedKeys(selectedAreas);
  const needsUpper = selected.has("meeting") || selected.has("service") || selectedAreas.length >= 5;

  return (
    <div className="commercial-assembly">
      <svg viewBox="-40 -20 880 620" role="img" aria-label="Architectural isometric commercial suite assembly">
        <defs>
          <filter id="commercialRoomGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <pattern id="commercial-carpet-tile" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 0h30v30H0zM15 0v30M0 15h30" fill="none" stroke="rgba(242,237,224,0.14)" strokeWidth="1" />
          </pattern>
          <pattern id="commercial-broadloom" width="18" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q5 5 10 10 T20 10" fill="none" stroke="rgba(242,237,224,0.13)" strokeWidth="1" />
          </pattern>
          <pattern id="commercial-safety" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.8" fill="rgba(242,237,224,0.15)" />
            <circle cx="9" cy="9" r="0.8" fill="rgba(242,237,224,0.1)" />
          </pattern>
          <pattern id="commercial-lvt" width="38" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 8h38M19 0v16" stroke="rgba(242,237,224,0.14)" strokeWidth="1" />
          </pattern>
          <pattern id="commercial-rubber" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1" fill="rgba(242,237,224,0.13)" />
            <circle cx="10" cy="9" r="0.9" fill="rgba(242,237,224,0.09)" />
          </pattern>
          <linearGradient id="officeLight" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(201,169,110,0.2)" />
            <stop offset="1" stopColor="rgba(201,169,110,0.02)" />
          </linearGradient>
        </defs>

        <ellipse cx="410" cy="530" rx="330" ry="48" fill="rgba(0,0,0,0.44)" />
        <CommercialFloor
          outline="60,220 228,156 540,82 684,240 750,318 512,430 322,498 150,330"
          areas={groundAreas}
          selected={selected}
          transform="translate(0 24)"
          label="Ground suite"
        />

        {needsUpper && (
          <>
            <path d="M492 356 C518 304 546 254 586 200" stroke="rgba(201,169,110,0.46)" strokeWidth="3" fill="none" strokeDasharray="10 8" />
            <CommercialFloor
              outline="330,138 520,92 660,130 742,222 654,238 462,292"
              areas={upperAreas}
              selected={selected}
              transform="translate(18 -70)"
              label="Upper workspace"
              elevated
            />
          </>
        )}
      </svg>
      <style>{`
        .commercial-assembly svg {
          display: block;
          width: 100%;
          height: auto;
          max-height: 260px;
        }
        .commercial-floor {
          transition: transform 0.65s cubic-bezier(.2,.8,.2,1), opacity 0.45s;
        }
        .commercial-room {
          animation: commercialFade 0.7s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes commercialFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 760px) {
          .commercial-assembly svg { max-height: 490px; }
        }
      `}</style>
    </div>
  );
}

function CommercialFloor({ outline, areas, selected, transform, label, elevated }) {
  return (
    <g className="commercial-floor" transform={transform}>
      {elevated && <polygon points={outline} fill="rgba(0,0,0,0.22)" transform="translate(16 86)" opacity="0.62" />}
      <polygon points={outline} fill="rgba(201,169,110,0.035)" stroke="rgba(201,169,110,0.25)" strokeWidth="1.5" />
      <polygon points={outline} fill="none" stroke={brand.gold} strokeWidth="4" strokeLinejoin="round" />
      <polygon points={outline} fill="rgba(201,169,110,0.02)" transform="translate(0 38)" stroke="rgba(201,169,110,0.16)" strokeWidth="1.1" />

      {areas.map(area => selected.has(area.key) && (
        <polygon key={`${area.key}-glow`} points={area.points} fill="rgba(201,169,110,0.24)" filter="url(#commercialRoomGlow)" opacity="0.66" />
      ))}

      {areas.map(area => {
        const active = selected.has(area.key);
        return (
          <g key={area.key} className="commercial-room">
            <polygon
              points={area.points}
              fill={active ? "rgba(201,169,110,0.12)" : "transparent"}
              stroke={active ? "#e8c982" : "rgba(201,169,110,0.45)"}
              strokeWidth={active ? "2.2" : "1.05"}
              strokeLinejoin="round"
            />
            {active && <polygon points={area.points} fill={`url(#${area.texture})`} opacity="0.64" />}
          </g>
        );
      })}

      <g stroke={brand.gold} strokeWidth="2.5" strokeLinejoin="round" fill="none" opacity="0.9">
        {areas.map(area => <polygon key={`${area.key}-wall`} points={area.points} />)}
      </g>
      <g stroke="rgba(201,169,110,0.28)" strokeWidth="1.1" fill="none">
        <path d="M60 220v36M150 330v38M322 498v38M512 430v38M750 318v38M684 240v38M540 82v34M228 156v34" />
      </g>
      <g fill="url(#officeLight)" opacity="0.72">
        <ellipse cx="330" cy="228" rx="170" ry="48" transform="rotate(-17 330 228)" />
        <ellipse cx="586" cy="286" rx="132" ry="40" transform="rotate(-18 586 286)" />
      </g>
      <g stroke="rgba(201,169,110,0.4)" fill="rgba(17,17,16,0.36)" strokeWidth="1.2">
        <rect x="270" y="176" width="150" height="32" rx="4" transform="rotate(-13 270 176)" />
        <rect x="474" y="276" width="118" height="42" rx="4" transform="rotate(-18 474 276)" />
        <rect x="110" y="240" width="96" height="26" rx="4" transform="rotate(-23 110 240)" />
      </g>
      <text x="46" y="80" fill="rgba(201,169,110,0.52)" fontSize="12" letterSpacing="0.14em">{label}</text>
    </g>
  );
}
