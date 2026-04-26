function parseNumber(value) {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

const STANDARD_DOOR_WIDTHS = [762, 838, 914];
const DEFAULT_DOOR_WIDTH = 838;

function normalizeText(value) {
  return (value || "").toString().trim();
}

function textIncludes(value, terms) {
  const text = normalizeText(value).toLowerCase();
  return terms.some((term) => text.includes(term));
}

function isCarpet(value) {
  return textIncludes(value, ["carpet"]);
}

function isTile(value) {
  return textIncludes(value, ["tile", "porcelain", "ceramic"]);
}

function isExterior(value) {
  return textIncludes(value, ["exterior", "outside", "garden", "patio", "doorway to outside"]);
}

function isRaised(value) {
  return textIncludes(value, ["raised", "higher", "step", "upstand", "riser", "above", "platform"]);
}

function isBare(value) {
  return textIncludes(value, ["bare", "no floor", "substrate", "subfloor", "concrete only", "timber only"]);
}

function isHardFloor(value) {
  return textIncludes(value, ["lvt", "laminate", "engineered", "hard floor", "vinyl", "wood", "hardwood", "real wood"]) && !isCarpet(value);
}

function doorWidthMM(value) {
  const measured = parseNumber(value);
  if (!measured) return DEFAULT_DOOR_WIDTH;
  const closest = STANDARD_DOOR_WIDTHS.reduce((best, width) => {
    return Math.abs(width - measured) < Math.abs(best - measured) ? width : best;
  }, STANDARD_DOOR_WIDTH);
  return closest;
}

function roomName(value, index) {
  const name = normalizeText(value);
  return name || `Room ${index + 1}`;
}

function makeTransitionLabel(transitionTo) {
  if (!transitionTo) return "next area";
  if (typeof transitionTo === "string") return transitionTo;
  if (transitionTo.adjacentRoom) return transitionTo.adjacentRoom;
  return "adjacent room";
}

function inferDoorBarType(fromFloor, toFloor) {
  if (isExterior(fromFloor) || isExterior(toFloor)) {
    return "EPDM weather seal threshold";
  }

  if (isCarpet(fromFloor) && isCarpet(toFloor)) {
    return "Threshold strip";
  }

  if (isCarpet(fromFloor) && isHardFloor(toFloor)) {
    return isRaised(toFloor) ? "Z bar" : "Carpet bar";
  }

  if (isHardFloor(fromFloor) && isCarpet(toFloor)) {
    return "Carpet bar";
  }

  if (isHardFloor(fromFloor) && isHardFloor(toFloor)) {
    return isRaised(fromFloor) || isRaised(toFloor) ? "Reducer strip" : "T bar";
  }

  if (isHardFloor(fromFloor) && isTile(toFloor)) {
    return "Tile trim";
  }

  if (isTile(fromFloor) && isHardFloor(toFloor)) {
    return "Tile trim";
  }

  if (isBare(fromFloor) || isBare(toFloor)) {
    return "End cap";
  }

  if (isCarpet(fromFloor) && isExterior(toFloor)) {
    return "EPDM weather seal threshold";
  }

  return "Threshold strip";
}

function inferDoorBarReason(type, fromFloor, toFloor) {
  const from = normalizeText(fromFloor);
  const to = normalizeText(toFloor);

  if (type === "Carpet bar") {
    return `Carpet to same level hard floor — carpet bar to finish the edge cleanly.`;
  }
  if (type === "Z bar") {
    return `Carpet to raised hard floor — height difference requires Z bar.`;
  }
  if (type === "T bar") {
    return `Hard floor to hard floor at same level — T bar provides a neat transition.`;
  }
  if (type === "Reducer strip") {
    return `Hard floor to hard floor with different heights — reducer strip bridges the change safely.`;
  }
  if (type === "Tile trim") {
    return `Hard floor to tile — a trim protects the edge and keeps the change in height tidy.`;
  }
  if (type === "Threshold strip") {
    return `Carpet to carpet between rooms — threshold strip provides a clean edge and protects both surfaces.`;
  }
  if (type === "End cap") {
    return `Doorway to bare floor or incomplete finish — end cap protects the edge and secures the finish.`;
  }
  if (type === "EPDM weather seal threshold") {
    return `External threshold requires a weather seal transition for a waterproof finish.`;
  }
  return `Transition from ${fromFloor || "existing floor"} to ${toFloor || "new flooring"}.`;
}

function normalizeRoom(room, index) {
  const grossM2 = parseNumber(room.grossM2 || room.grossm2 || room.gross || room.area || room.m2);
  return {
    name: roomName(room.name, index),
    lengthM: parseNumber(room.lengthM || room.length || room.l || 0),
    widthM: parseNumber(room.widthM || room.width || room.w || 0),
    grossM2: grossM2 || Math.max(0, parseNumber(room.lengthM || room.length || 0) * parseNumber(room.widthM || room.width || 0)),
    subfloorType: normalizeText(room.subfloorType || room.subfloor || ""),
    existingFlooring: normalizeText(room.existingFlooring || room.existingFloor || room.existing || ""),
    transitionTo: room.transitionTo || null,
    doorWidthMM: doorWidthMM(room.doorWidthMM || room.doorWidth || room.widthMM || room.width),
  };
}

function createDoorBars(rooms, flooringType) {
  const bars = [];
  rooms.forEach((room) => {
    const fromFloor = room.existingFlooring || room.subfloorType || "bare";
    const toFloor = flooringType || "hard floor";
    const type = inferDoorBarType(fromFloor, toFloor);
    const adjacent = makeTransitionLabel(room.transitionTo);
    const location = `${room.name} to ${adjacent}`;

    bars.push({
      location,
      type,
      reason: inferDoorBarReason(type, fromFloor, toFloor),
      widthMM: room.doorWidthMM || DEFAULT_DOOR_WIDTH,
      finish: "Brushed silver",
      quantity: 1,
    });
  });
  return bars;
}

function calculateUnderlay(rooms, flooringType) {
  const isCarpetJob = isCarpet(flooringType);
  if (!isCarpetJob) return null;

  const total = Math.max(0.5, rooms.reduce((sum, room) => sum + room.grossM2, 0));
  const reasonFloor = rooms.some((room) => textIncludes(room.subfloorType, ["timber", "boards"]))
    ? "Mid grade carpet, timber subfloor"
    : "Mid grade carpet, timber or concrete subfloor";

  return {
    type: "10mm PU foam",
    reason: reasonFloor,
    m2Required: Number((total * 1.05).toFixed(1)),
    linearMetresGripper: Math.max(8, Math.round(total * 0.75)),
  };
}

function calculateGripperRods(rooms, flooringType) {
  const underlay = calculateUnderlay(rooms, flooringType);
  if (!underlay) {
    return {
      linearMetres: 0,
      notes: "Not required for this hard floor install.",
    };
  }

  const timberSubfloor = rooms.some((room) => textIncludes(room.subfloorType, ["timber", "boards"]));
  return {
    linearMetres: underlay.linearMetresGripper,
    notes: timberSubfloor ? "Standard pin gripper for timber subfloor" : "Standard pin gripper for concrete or timber subfloor",
  };
}

function needsPlyBoarding(rooms, flooringType) {
  const hardFloorJob = isHardFloor(flooringType) || isTile(flooringType);
  const timberSubfloor = rooms.some((room) => textIncludes(room.subfloorType, ["timber", "boards", "joist", "floorboards"]));
  if (hardFloorJob && timberSubfloor) {
    return {
      required: true,
      reason: "Timber subfloor usually needs ply boarding before hard floor installation.",
    };
  }
  return {
    required: false,
    reason: "Timber subfloor confirmed flat at survey.",
  };
}

export function generateMaterialsSpec({ flooringType, rooms = [], serviceType = "Supply and fit" }) {
  const normalizedRooms = rooms.length
    ? rooms.map(normalizeRoom)
    : [normalizeRoom({ name: "Main area", grossM2: 0 })];

  const doorBars = createDoorBars(normalizedRooms, flooringType);
  const underlay = calculateUnderlay(normalizedRooms, flooringType);
  const gripperRods = calculateGripperRods(normalizedRooms, flooringType);
  const plyBoarding = needsPlyBoarding(normalizedRooms, flooringType);

  const specialistItems = [];
  const totalItemCount = doorBars.length + (underlay ? 1 : 0) + 1 + specialistItems.length;

  return {
    doorBars,
    underlay,
    gripperRods,
    adhesive: null,
    plyBoarding,
    specialistItems,
    totalItemCount,
    generatedAt: new Date().toISOString(),
  };
}
