// ═══════════════════════════════════════════════════════════════
// STRATA PRICE CONFIG — replace with your uncle's real rates
// ═══════════════════════════════════════════════════════════════
const PRICES = {

  // Supply & fit (£/m²) — per flooring type, per grade
  flooring: {
    "Carpet":       { Budget: { low: 12, high: 18 }, Mid: { low: 22, high: 32 }, Premium: { low: 35, high: 55 }, default: { low: 15, high: 45 } },
    "Herringbone":  { Budget: { low: 25, high: 40 }, Mid: { low: 50, high: 80 }, Premium: { low: 85, high: 130 }, default: { low: 50, high: 110 } },
    "LVT":          { Budget: { low: 20, high: 30 }, Mid: { low: 30, high: 45 }, Premium: { low: 45, high: 65 }, default: { low: 25, high: 55 } },
    "Laminate":     { Budget: { low: 12, high: 20 }, Mid: { low: 20, high: 30 }, Premium: { low: 30, high: 45 }, default: { low: 15, high: 40 } },
    "Vinyl":        { Budget: { low: 10, high: 18 }, Mid: { low: 18, high: 28 }, Premium: { low: 28, high: 40 }, default: { low: 12, high: 35 } },
    "Not sure yet": { default: { low: 20, high: 80 } },
  },

  // Fit only (£/m²)
  fitOnly: {
    "Carpet":       { low: 6,  high: 14 },
    "Herringbone":  { low: 18, high: 30 },
    "LVT":          { low: 8,  high: 18 },
    "Laminate":     { low: 6,  high: 14 },
    "Vinyl":        { low: 5,  high: 12 },
    "Not sure yet": { low: 8,  high: 20 },
  },

  // Floor removal (£/m²)
  removal: {
    "Carpet":         { low: 3,  high: 6  },
    "Hard floor":     { low: 6,  high: 12 },
    "Tiles":          { low: 10, high: 20 },
    "Vinyl":          { low: 4,  high: 8  },
    "Bare / nothing": null,
  },

  // Subfloor prep (£/m²)
  subfloor: {
    "Concrete":        { low: 8,  high: 18 },
    "Timber / boards": { low: 4,  high: 10 },
  },

  // Room complexity uplifts (flat £ per room)
  complexity: {
    "Stairs":           { low: 80,  high: 180 },
    "Hallway":          { low: 20,  high: 50  },
    "Corridor / Hallway":{ low: 20, high: 50  },
    "Bay window":       { low: 30,  high: 60  },
    "Alcoves":          { low: 20,  high: 40  },
    "Awkward shape":    { low: 30,  high: 70  },
  },

  // Additional services (flat £ each)
  extras: {
    uplift:    { low: 50,  high: 120, label: "Uplift & disposal" },
    ply:       { low: 100, high: 300, label: "Ply boarding" },
    latex:     { low: 80,  high: 250, label: "Latex levelling" },
    gripper:   { low: 30,  high: 60,  label: "New gripper rods" },
    doorbar:   { low: 20,  high: 60,  label: "Door bars / thresholds" },
    furniture: { low: 40,  high: 80,  label: "Furniture moving" },
    membrane:  { low: 60,  high: 150, label: "Moisture membrane" },
  },

  minimumCharge: 250,
  leadTime: "2–4 weeks from survey",
};
// ═══════════════════════════════════════════════════════════════

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      rooms, propertyType, flooringType, flooringGrade,
      currentFloor, subfloorType, extras,
      budget, serviceType, totalGrossM2,
    } = body;

    const m2 = parseFloat(totalGrossM2 || 0);
    const roomList = rooms?.join(", ") || "unspecified";
    const removalNeeded = currentFloor && currentFloor !== "Bare / nothing";
    const isSupplyAndFit = !serviceType || serviceType === "Supply & fit";

    // Get flooring price — use grade if provided
    const flooringGroup = PRICES.flooring[flooringType] || PRICES.flooring["Not sure yet"];
    const flooringPrice = isSupplyAndFit
      ? (flooringGrade && flooringGroup[flooringGrade] ? flooringGroup[flooringGrade] : flooringGroup.default || { low: 20, high: 80 })
      : (PRICES.fitOnly[flooringType] || PRICES.fitOnly["Not sure yet"]);

    const removalPrice  = removalNeeded ? (PRICES.removal[currentFloor] || null) : null;
    const subfloorPrice = subfloorType  ? (PRICES.subfloor[subfloorType] || null) : null;

    // Complexity uplifts from room names
    const complexityItems = [];
    if (rooms?.includes("Stairs"))              complexityItems.push({ label: "Stairs",            ...PRICES.complexity["Stairs"] });
    if (rooms?.some(r => r.includes("Hallway"))) complexityItems.push({ label: "Hallway preparation", ...PRICES.complexity["Hallway"] });

    // Extras
    const extraItems = (extras || [])
      .filter(id => PRICES.extras[id])
      .map(id => ({ label: PRICES.extras[id].label, low: PRICES.extras[id].low, high: PRICES.extras[id].high }));

    // Calculate all line totals
    const flooringLow  = Math.round(flooringPrice.low  * m2);
    const flooringHigh = Math.round(flooringPrice.high * m2);
    const removalLow   = removalPrice  ? Math.round(removalPrice.low   * m2) : 0;
    const removalHigh  = removalPrice  ? Math.round(removalPrice.high  * m2) : 0;
    const subfloorLow  = subfloorPrice ? Math.round(subfloorPrice.low  * m2) : 0;
    const subfloorHigh = subfloorPrice ? Math.round(subfloorPrice.high * m2) : 0;
    const complexLow   = complexityItems.reduce((s, c) => s + c.low,  0);
    const complexHigh  = complexityItems.reduce((s, c) => s + c.high, 0);
    const extrasLow    = extraItems.reduce((s, e) => s + e.low,  0);
    const extrasHigh   = extraItems.reduce((s, e) => s + e.high, 0);

    const totalLow  = Math.max(Math.round((flooringLow  + removalLow  + subfloorLow  + complexLow  + extrasLow)  / 10) * 10, PRICES.minimumCharge);
    const totalHigh = Math.max(Math.round((flooringHigh + removalHigh + subfloorHigh + complexHigh + extrasHigh) / 10) * 10, PRICES.minimumCharge);

    const flooringLabel = [
      isSupplyAndFit ? "Supply & fit" : "Fit only",
      `${m2.toFixed(1)} m²`,
      flooringType || "flooring",
      flooringGrade ? `(${flooringGrade})` : "",
      "(inc. wastage)",
    ].filter(Boolean).join(" — ").replace("— (", "(");

    const breakdownLines = [
      { label: flooringLabel, low: flooringLow, high: flooringHigh },
      ...(removalPrice  ? [{ label: `Floor removal (${currentFloor})`, low: removalLow, high: removalHigh }] : []),
      ...(subfloorPrice ? [{ label: `Subfloor prep (${subfloorType})`, low: subfloorLow, high: subfloorHigh }] : []),
      ...complexityItems,
      ...extraItems,
    ];

    const assumptions = [
      `Based on ${m2.toFixed(1)} m² including material wastage allowance`,
      `${propertyType || "Residential"} installation`,
      `Prices include ${isSupplyAndFit ? "materials and installation" : "fitting only"}${removalPrice ? ", floor removal" : ""}${subfloorPrice ? ", subfloor preparation" : ""}`,
      "Final price confirmed at your free on-site survey — no obligation",
    ];

    return Response.json({
      success: true,
      estimate: {
        lowEstimate: totalLow,
        highEstimate: totalHigh,
        breakdown: breakdownLines,
        keyAssumptions: assumptions,
        leadTime: PRICES.leadTime,
      },
    });

  } catch (err) {
    console.error("Strata quote error:", err);
    return Response.json({ success: false, error: "Estimate unavailable" }, { status: 500 });
  }
}1