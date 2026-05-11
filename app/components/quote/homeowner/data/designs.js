// Design photo card arrays extracted from DesignPicker.jsx.
// Carpet pile types are SVG-rendered (see DesignPicker.jsx) — only image-based designs are here.
// Each entry: { id, src, label }

export const DESIGNS = {
  LVT: [
    { id: "lvt-wood",     src: "/woodeffect-lvt-design.png",   label: "Wood Effect" },
    { id: "lvt-stone",    src: "/stone-lvt-design.png",        label: "Stone Effect" },
    { id: "lvt-abstract", src: "/geometric-lvt-design.png",    label: "Abstract / Contemporary" },
  ],
  Laminate: [
    { id: "lam-light",   src: "/white-washed-laminate-design.png", label: "Light Oak" },
    { id: "lam-dark",    src: "/dark-walnut-laminate-design.png",  label: "Dark Oak" },
    { id: "lam-grey",    src: "/grey-smoked-laminate-design.png",  label: "Grey" },
    { id: "lam-herring", src: "/herringbone-design.png",           label: "Herringbone" },
  ],
  Vinyl: [
    { id: "vinyl-plain", src: "/plain-vinyl-design.png",              label: "Plain / Solid" },
    { id: "vinyl-wood",  src: "/wood-effect-style-vinyl.webp",        label: "Wood Effect" },
    { id: "vinyl-tile",  src: "/tile-effect-style-vinyl-png.webp",    label: "Tile Effect" },
  ],
};
