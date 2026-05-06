import { brand } from "../../lib/brand";

const groundShellCompact = "70,320 286,218 392,330 536,380 682,198 760,282 598,548 250,526 172,435";
const groundShellWide = "70,320 286,218 360,188 590,102 686,132 760,282 790,360 598,548 250,526 112,468 18,360";
const upperShellCompact = "250,190 430,116 628,156 748,286 624,416 410,480 268,342";
const upperShellWide = "178,232 250,190 430,116 628,156 748,286 790,360 624,416 410,480 268,342";

const groundRooms = [
  { id: "Living Room", points: "70,320 286,218 392,330 172,435", texture: "texture-carpet", selectedBy: "Living Room" },
  { id: "Hallway", points: "286,218 360,188 536,380 464,414 392,330", texture: "texture-herringbone", selectedBy: "Hallway" },
  { id: "Kitchen", points: "360,188 590,102 682,198 536,380 392,330", texture: "texture-lvt", selectedBy: "Kitchen" },
  { id: "Bathroom", points: "590,102 686,132 760,282 682,198", texture: "texture-tile", selectedBy: "Bathroom" },
  { id: "Dining Room", points: "172,435 392,330 464,414 250,526", texture: "texture-lvt", selectedBy: "Dining Room" },
  { id: "Home Office", points: "464,414 536,380 682,508 598,548", texture: "texture-saxony", selectedBy: "Home Office" },
];

const bungalowBedroom = { id: "Bedroom 1", points: "536,380 682,198 790,360 598,548", texture: "texture-carpet", selectedBy: "Bedroom" };

const upperRooms = [
  { id: "Bedroom 1", points: "430,116 628,156 748,286 556,352", texture: "texture-carpet", selectedBy: "Bedroom" },
  { id: "Bedroom 2", points: "250,190 430,116 556,352 370,420", texture: "texture-berber", selectedBy: "Bedroom" },
  { id: "Bedroom 3", points: "556,352 748,286 790,360 624,416", texture: "texture-saxony", selectedBy: "Bedroom" },
  { id: "Bedroom 4", points: "178,232 250,190 370,420 268,342", texture: "texture-carpet", selectedBy: "Bedroom" },
  { id: "Bedroom 5", points: "268,342 370,420 410,480 300,438", texture: "texture-berber", selectedBy: "Bedroom" },
  { id: "Landing", points: "370,420 556,352 624,416 410,480", texture: "texture-herringbone", selectedBy: "Landing" },
];

const has = (set, room) => set.has(room);

function roomIsSelected(room, selectedSet) {
  return selectedSet.has(room.selectedBy || room.id);
}

function bedroomRooms(count, multiLevel) {
  if (!multiLevel) return count > 0 ? [bungalowBedroom] : [];
  return upperRooms.filter(room => room.id.startsWith("Bedroom")).slice(0, count);
}

export default function HouseVisualiser({ selectedRooms, bedroomCount = 1 }) {
  const selectedSet = new Set(selectedRooms);
  const hasBedroom = has(selectedSet, "Bedroom");
  const wantsStairs = has(selectedSet, "Stairs") || has(selectedSet, "Landing");
  const multiLevel = (hasBedroom && bedroomCount > 1) || wantsStairs;
  const shellWide = bedroomCount >= 3 || has(selectedSet, "Dining Room") || has(selectedSet, "Home Office");
  const lowerRooms = [
    ...groundRooms.filter(room => selectedSet.has(room.selectedBy)),
    ...(!multiLevel && hasBedroom ? bedroomRooms(bedroomCount, false) : []),
  ];
  const upstairsRooms = multiLevel ? [
    ...(hasBedroom ? bedroomRooms(bedroomCount, true) : []),
    ...(wantsStairs ? [upperRooms.find(room => room.id === "Landing")] : []),
  ].filter(Boolean) : [];

  return (
    <div className="home-assembly">
      <svg viewBox="-80 10 930 650" role="img" aria-label="Architectural isometric home assembly">
        <defs>
          <filter id="homeSelectedGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
          <linearGradient id="homeLight" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(201,169,110,0.28)" />
            <stop offset="1" stopColor="rgba(201,169,110,0.03)" />
          </linearGradient>
          <pattern id="texture-carpet" width="18" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 9 Q4 4 8 9 T18 9" fill="none" stroke="rgba(242,237,224,0.16)" strokeWidth="1" />
          </pattern>
          <pattern id="texture-berber" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.3" fill="rgba(242,237,224,0.14)" />
            <circle cx="10" cy="10" r="1.3" fill="rgba(242,237,224,0.1)" />
          </pattern>
          <pattern id="texture-saxony" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M2 14 C4 6 7 6 9 14M9 14 C11 6 14 6 16 14" fill="none" stroke="rgba(242,237,224,0.13)" strokeWidth="0.9" />
          </pattern>
          <pattern id="texture-lvt" width="38" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 8h38M19 0v16" stroke="rgba(242,237,224,0.14)" strokeWidth="1" />
          </pattern>
          <pattern id="texture-herringbone" width="30" height="22" patternUnits="userSpaceOnUse">
            <path d="M0 11 15 0 30 11M0 22 15 11 30 22" fill="none" stroke="rgba(242,237,224,0.18)" strokeWidth="1" />
          </pattern>
          <pattern id="texture-tile" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M0 0h28v28H0zM14 0v28M0 14h28" fill="none" stroke="rgba(242,237,224,0.13)" strokeWidth="1" />
          </pattern>
        </defs>

        <ellipse cx="385" cy="590" rx="338" ry="54" fill="rgba(0,0,0,0.48)" />
        <FloorPlate
          shell={shellWide ? groundShellWide : groundShellCompact}
          rooms={lowerRooms}
          selectedSet={selectedSet}
          transform="translate(0 38)"
          label={multiLevel ? "Ground floor" : "Single floor home"}
          lower
          wide={shellWide}
        />

        {multiLevel && (
          <>
            <path d="M336 466 C356 414 388 360 432 306" stroke="rgba(201,169,110,0.5)" strokeWidth="3" fill="none" strokeDasharray="9 8" />
            <g className="stairs" transform="translate(318 416)">
              <path d="M0 102h23V80h23V58h23V36h23V14h23" fill="none" stroke="#e8c982" strokeWidth="3" />
              <path d="M2 102 96 58" stroke="rgba(201,169,110,0.34)" strokeWidth="1.3" />
            </g>
            <FloorPlate
              shell={bedroomCount >= 4 ? upperShellWide : upperShellCompact}
              rooms={upstairsRooms}
              selectedSet={selectedSet}
              transform="translate(24 -96)"
              label="Upper floor"
              elevated
              wide={bedroomCount >= 4}
            />
          </>
        )}
      </svg>
      <style>{`
        .home-assembly svg {
          display: block;
          width: 100%;
          height: auto;
          max-height: 260px;
        }
        .floor-plate {
          transition: transform 0.7s cubic-bezier(.2,.8,.2,1), opacity 0.45s;
        }
        .room-cell {
          animation: roomAppear 0.72s cubic-bezier(.2,.8,.2,1) both;
        }
        .room-poly {
          transition: fill 0.45s, stroke 0.45s, opacity 0.45s;
        }
        .outer-wall {
          fill: none;
          stroke: ${brand.gold};
          stroke-linejoin: round;
          stroke-linecap: square;
        }
        .detail-line {
          fill: none;
          stroke: rgba(201,169,110,0.48);
          stroke-width: 1.45;
        }
        .window-line {
          fill: none;
          stroke: rgba(242,237,224,0.45);
          stroke-width: 2;
        }
        .furniture-line {
          stroke: rgba(201,169,110,0.34);
          fill: rgba(17,17,16,0.36);
          stroke-width: 1.15;
        }
        @keyframes roomAppear {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 760px) {
          .home-assembly svg { max-height: 520px; }
        }
      `}</style>
    </div>
  );
}

function FloorPlate({ shell, rooms, selectedSet, transform, label, elevated, lower, wide }) {
  return (
    <g className="floor-plate" transform={transform}>
      {elevated && <polygon points={shell} fill="rgba(0,0,0,0.28)" transform="translate(18 92)" opacity="0.62" />}
      <polygon points={shell} fill="rgba(201,169,110,0.035)" stroke="rgba(201,169,110,0.18)" strokeWidth="1.2" />
      <polygon points={shell} fill="rgba(201,169,110,0.018)" transform="translate(0 42)" stroke="rgba(201,169,110,0.14)" strokeWidth="1.1" />
      <polygon points={shell} className="outer-wall" strokeWidth="4" />

      {rooms.map(room => {
        const selected = roomIsSelected(room, selectedSet);
        return selected ? (
          <polygon key={`${room.id}-glow`} points={room.points} fill="rgba(201,169,110,0.24)" filter="url(#homeSelectedGlow)" opacity="0.66" />
        ) : null;
      })}

      {rooms.map(room => {
        const selected = roomIsSelected(room, selectedSet);
        return (
          <g key={room.id} className="room-cell">
            <polygon
              className="room-poly"
              points={room.points}
              fill={selected ? "rgba(201,169,110,0.12)" : "transparent"}
              stroke={selected ? "#e8c982" : "rgba(201,169,110,0.38)"}
              strokeWidth={selected ? "2.1" : "0.95"}
              strokeLinejoin="round"
            />
            {selected && <polygon points={room.points} fill={`url(#${room.texture})`} opacity="0.58" />}
          </g>
        );
      })}

      <g className="outer-wall" strokeWidth="2.4" opacity="0.75">
        {rooms.map(room => <polygon key={`${room.id}-line`} points={room.points} />)}
      </g>
      <g className="detail-line">
        {lower ? (
          <>
            <path d="M392 330 q-34 11-56-14" />
            <path d="M536 380 q-32-30 0-70" />
            <path d="M286 218 q34 4 54 30" />
            <path d="M684 202 q-27 1-45-21" />
          </>
        ) : (
          <>
            <path d="M372 418 q-24-32 4-66" />
            <path d="M556 352 q-32 8-55-16" />
            <path d="M628 156 q-26 0-44-20" />
          </>
        )}
      </g>
      <g className="window-line">
        {lower ? (
          <>
            <path d="M94 319 186 276M106 334 198 291" />
            <path d="M416 166 512 130M428 180 524 144" />
            <path d="M628 512 708 474M640 526 720 488" />
          </>
        ) : (
          <>
            <path d="M282 184 360 150M294 198 372 164" />
            <path d="M638 172 710 230M650 186 722 244" />
          </>
        )}
      </g>
      <g fill="url(#homeLight)" opacity="0.75">
        <ellipse cx="250" cy="330" rx="136" ry="46" transform="rotate(-24 250 330)" />
        <ellipse cx="538" cy="248" rx="154" ry="48" transform="rotate(-24 538 248)" />
        {wide && <ellipse cx="608" cy="456" rx="118" ry="36" transform="rotate(-24 608 456)" />}
      </g>
      <g className="furniture-line">
        {lower ? (
          <>
            <rect x="176" y="288" width="92" height="34" rx="5" transform="rotate(-24 176 288)" />
            <ellipse cx="232" cy="366" rx="38" ry="16" transform="rotate(-24 232 366)" />
            <rect x="454" y="180" width="132" height="28" rx="4" transform="rotate(-18 454 180)" />
            <rect x="512" y="256" width="92" height="44" rx="4" transform="rotate(-24 512 256)" />
          </>
        ) : (
          <>
            <rect x="508" y="222" width="126" height="52" rx="5" transform="rotate(-24 508 222)" />
            <rect x="314" y="250" width="110" height="48" rx="5" transform="rotate(-24 314 250)" />
          </>
        )}
      </g>
      <text x="42" y="72" fill="rgba(201,169,110,0.5)" fontSize="12" letterSpacing="0.14em">{label}</text>
    </g>
  );
}
