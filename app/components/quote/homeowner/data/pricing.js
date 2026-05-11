// Pricing constants for the homeowner estimate calculator.
// All prices are per m², supply and fit.

export const WASTAGE_RATES = {
  Carpet:   0.12,
  LVT:      0.12,
  Laminate: 0.12,
  Vinyl:    0.15,
};

export const PRICE_RANGES = {
  Carpet:   { low: 22, high: 38 },
  LVT:      { low: 30, high: 52 },
  Laminate: { low: 22, high: 40 },
  Vinyl:    { low: 18, high: 35 },
  default:  { low: 22, high: 40 },
};
