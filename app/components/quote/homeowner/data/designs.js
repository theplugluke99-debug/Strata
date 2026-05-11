// Design card data for DesignPicker.
// Carpet entries use inline SVG functions; other types use image paths.

function TwistSVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[10, 20, 30, 40, 50].map((x) => (
        <g key={x}>
          <path d={`M${x-3},70 C${x-5},55 ${x+1},45 ${x-3},30 C${x-5},15 ${x+1},5 ${x-3},2`} stroke="rgba(201,169,110,0.7)" strokeWidth="2" strokeLinecap="round"/>
          <path d={`M${x+3},70 C${x+5},55 ${x-1},45 ${x+3},30 C${x+5},15 ${x-1},5 ${x+3},2`} stroke="rgba(201,169,110,0.4)" strokeWidth="2" strokeLinecap="round"/>
        </g>
      ))}
    </svg>
  );
}

function LoopSVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const cx = 10 + col * 18;
          const cy = 60 - row * 22;
          return (
            <path
              key={`${row}-${col}`}
              d={`M${cx-6},${cy} C${cx-6},${cy-16} ${cx+6},${cy-16} ${cx+6},${cy}`}
              stroke="rgba(201,169,110,0.75)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          );
        })
      )}
      <line x1="4" y1="66" x2="56" y2="66" stroke="rgba(201,169,110,0.2)" strokeWidth="1.5"/>
    </svg>
  );
}

function SaxonySVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[8, 16, 24, 32, 40, 48, 56].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="70" x2={x - 2 + (i % 2) * 4} y2="6" stroke="rgba(201,169,110,0.6)" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx={x - 2 + (i % 2) * 4} cy="6" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.35)"/>
        </g>
      ))}
    </svg>
  );
}

function BerberSVG() {
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {[0,1,2,3].map((row) =>
        [0,1,2,3,4].map((col) => {
          const cx = 6 + col * 12;
          const cy = 12 + row * 16;
          const offset = (row % 2) * 6;
          return (
            <path
              key={`${row}-${col}`}
              d={`M${cx+offset-4},${cy} C${cx+offset-4},${cy-8} ${cx+offset+4},${cy-8} ${cx+offset+4},${cy}`}
              stroke="rgba(201,169,110,0.65)"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          );
        })
      )}
    </svg>
  );
}

function ShaggySVG() {
  const strands = [
    [10, 4, 8, 70], [18, 2, 20, 68], [26, 6, 24, 72], [34, 3, 36, 70],
    [42, 5, 40, 72], [50, 2, 52, 68], [14, 5, 12, 65], [22, 3, 26, 67],
    [30, 4, 28, 71], [38, 2, 40, 66], [46, 5, 44, 70],
  ];
  return (
    <svg viewBox="0 0 60 72" fill="none" width="100%" height="100%">
      {strands.map(([x1, y1, x2, y2], i) => (
        <path
          key={i}
          d={`M${x1},${y2} C${x1 + 4},${(y1 + y2) / 2} ${x2 - 3},${(y1 + y2) / 2 - 8} ${x2},${y1}`}
          stroke={`rgba(201,169,110,${0.4 + (i % 3) * 0.15})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}

export const DESIGNS = {
  Carpet: [
    { id: "twist",  label: "Twist",  desc: "Durable, practical, hides footprints",   svg: <TwistSVG /> },
    { id: "loop",   label: "Loop",   desc: "Textured, resilient, great for hallways", svg: <LoopSVG /> },
    { id: "saxony", label: "Saxony", desc: "Luxurious, formal, cut pile",             svg: <SaxonySVG /> },
    { id: "berber", label: "Berber", desc: "Natural look, flat weave, hardwearing",   svg: <BerberSVG /> },
    { id: "shaggy", label: "Shaggy", desc: "Tactile, cosy, barefoot comfort",         svg: <ShaggySVG /> },
  ],
  LVT: [
    { id: "lvt-wood",     label: "Wood Effect",             img: "/woodeffect-lvt-design.png" },
    { id: "lvt-stone",    label: "Stone Effect",            img: "/stone-lvt-design.png" },
    { id: "lvt-abstract", label: "Abstract / Contemporary", img: "/geometric-lvt-design.png" },
  ],
  Laminate: [
    { id: "lam-light",   label: "Light Oak",   img: "/white-washed-laminate-design.png" },
    { id: "lam-dark",    label: "Dark Oak",    img: "/dark-walnut-laminate-design.png" },
    { id: "lam-grey",    label: "Grey",        img: "/grey-smoked-laminate-design.png" },
    { id: "lam-herring", label: "Herringbone", img: "/herringbone-design.png" },
  ],
  Vinyl: [
    { id: "vinyl-plain", label: "Plain / Solid", img: "/plain-vinyl-design.png" },
    { id: "vinyl-wood",  label: "Wood Effect",   img: "/wood-effect-style-vinyl.webp" },
    { id: "vinyl-tile",  label: "Tile Effect",   img: "/tile-effect-style-vinyl-png.webp" },
  ],
};
