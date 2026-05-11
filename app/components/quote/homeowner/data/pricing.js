// Pricing constants extracted from QuoteFormProvider.jsx (computeEstimate) and MeasuringTool.jsx.
// All prices are per m², supply and fit.

export const WASTAGE_RATES = {
  default: 1.1, // 10% added to raw floor area for cuts and joins
};

export const PRICE_RANGES = {
  Carpet:   { low: 22, high: 38 },
  LVT:      { low: 30, high: 52 },
  Laminate: { low: 22, high: 40 },
  Vinyl:    { low: 18, high: 35 },
  default:  { low: 22, high: 40 },
};
