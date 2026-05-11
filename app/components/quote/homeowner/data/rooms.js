// Room name list and icon map for the homeowner room selector.
// Icons are functions (c) => <svg> accepting a stroke colour, rendered at 16×16.

export const RESIDENTIAL_ROOMS = [
  "Living Room",
  "Dining Room",
  "Kitchen",
  "Hallway",
  "Landing",
  "Stairs",
  "Study / Home Office",
  "Playroom / Nursery",
  "Conservatory",
  "Utility Room",
  "Bathroom",
  "En Suite",
  "Dressing Room",
  "Gym / Home Gym",
  "Garage",
];

export const ROOM_ICONS = {
  "Living Room": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="11" width="20" height="7" rx="2"/>
      <rect x="2" y="9" width="4" height="5" rx="1"/>
      <rect x="18" y="9" width="4" height="5" rx="1"/>
      <line x1="6" y1="18" x2="6" y2="22"/>
      <line x1="18" y1="18" x2="18" y2="22"/>
    </svg>
  ),
  "Dining Room": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="9" width="12" height="6" rx="1"/>
      <line x1="9" y1="9" x2="9" y2="6"/>
      <line x1="15" y1="9" x2="15" y2="6"/>
      <line x1="9" y1="15" x2="9" y2="18"/>
      <line x1="15" y1="15" x2="15" y2="18"/>
    </svg>
  ),
  "Kitchen": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2"/>
      <rect x="6" y="12" width="12" height="7" rx="1"/>
      <circle cx="8" cy="8" r="1.8"/>
      <circle cx="16" cy="8" r="1.8"/>
    </svg>
  ),
  "Hallway": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="1"/>
      <circle cx="15.5" cy="12" r="1" fill={c} stroke="none"/>
      <rect x="7" y="4" width="10" height="6" rx="0.5"/>
    </svg>
  ),
  "Landing": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
      <path d="M12 7V12M9.5 9.5L12 7L14.5 9.5" fill="none"/>
    </svg>
  ),
  "Stairs": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20H9V15H14V10H19V5"/>
    </svg>
  ),
  "Study / Home Office": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="10" rx="1"/>
      <line x1="12" y1="13" x2="12" y2="16"/>
      <line x1="9" y1="16" x2="15" y2="16"/>
      <rect x="2" y="17" width="20" height="4" rx="1"/>
    </svg>
  ),
  "Playroom / Nursery": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"/>
      <line x1="4" y1="7.5" x2="20" y2="7.5"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
  ),
  "Conservatory": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L21 9V21H3V9L12 3Z"/>
      <line x1="8" y1="9" x2="8" y2="21"/>
      <line x1="16" y1="9" x2="16" y2="21"/>
      <line x1="3" y1="14" x2="21" y2="14"/>
    </svg>
  ),
  "Utility Room": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="12" cy="13" r="4"/>
      <line x1="3" y1="8" x2="21" y2="8"/>
      <circle cx="7" cy="5.5" r="1" fill={c} stroke="none"/>
      <circle cx="10.5" cy="5.5" r="1" fill={c} stroke="none"/>
    </svg>
  ),
  "Bathroom": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10H20V16A4 4 0 0 1 16 20H8A4 4 0 0 1 4 16V10Z"/>
      <path d="M4 10V7A2 2 0 0 1 8 7V10"/>
      <line x1="7" y1="20" x2="7" y2="22"/>
      <line x1="17" y1="20" x2="17" y2="22"/>
    </svg>
  ),
  "En Suite": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3"/>
      <line x1="12" y1="9" x2="12" y2="11"/>
      <line x1="8" y1="12" x2="6.5" y2="16"/>
      <line x1="10" y1="12" x2="9" y2="17"/>
      <line x1="12" y1="12" x2="12" y2="18"/>
      <line x1="14" y1="12" x2="15" y2="17"/>
      <line x1="16" y1="12" x2="17.5" y2="16"/>
    </svg>
  ),
  "Dressing Room": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5C13.1 5 14 5.9 14 7"/>
      <path d="M12 5C10.9 5 10 5.9 10 7"/>
      <path d="M10 7C10 7 4 10 4 20H20C20 10 14 7 14 7"/>
    </svg>
  ),
  "Gym / Home Gym": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="9" width="4" height="6" rx="1"/>
      <rect x="19" y="9" width="4" height="6" rx="1"/>
      <rect x="5" y="7" width="3" height="10" rx="1"/>
      <rect x="16" y="7" width="3" height="10" rx="1"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  "Garage": (c) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9L12 3L22 9V22H2V9Z"/>
      <rect x="2" y="9" width="20" height="13"/>
      <line x1="2" y1="13" x2="22" y2="13"/>
      <line x1="2" y1="17" x2="22" y2="17"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
    </svg>
  ),
};

export const BedroomIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="18" height="11" rx="2"/>
    <line x1="3" y1="13" x2="21" y2="13"/>
    <rect x="5" y="9.5" width="5" height="3.5" rx="1"/>
    <rect x="14" y="9.5" width="5" height="3.5" rx="1"/>
  </svg>
);
