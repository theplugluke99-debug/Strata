"use client";
import { createContext, useContext, useReducer, useCallback } from "react";

const initialRoom = () => ({
  flooringType: null,
  mood: null,
  practicalFlags: [],
  dimensions: { length: "", width: "", unit: "m", area: null, skipToSurvey: false },
  design: null,
  colour: null,
  stairsType: null,
  runnerStyle: null,
});

const initialState = {
  customerType: null,
  step: 0,

  homeowner: {
    selectedRooms: [],
    additionalBedrooms: 0,
    currentRoomIndex: 0,
    rooms: {},
    floRecommendations: null,
  },

  landlord: {
    portfolioSize: null,
    propertyType: null,
    selectedRooms: [],
    additionalBedrooms: 0,
    rooms: {},
    floorCondition: null,
    priority: null,
    floRecommendations: null,
  },

  commercial: {
    businessType: null,
    squareMeterage: "",
    footfallLevel: null,
    existingFloor: null,
    timeline: null,
    requirements: [],
    floProposal: null,
    contact: { name: "", company: "", email: "", phone: "", postcode: "" },
    submitted: false,
  },

  publicSector: {
    conversation: [],
    summary: null,
    contact: { name: "", organisation: "", email: "", phone: "" },
    submitted: false,
  },

  estimate: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_CUSTOMER_TYPE":
      return { ...state, customerType: action.payload, step: 0 };

    case "SET_STEP":
      return { ...state, step: action.payload };

    // ── Homeowner ──────────────────────────────────────────────────
    case "HO_SET_ROOMS": {
      const rooms = {};
      action.payload.forEach((name) => {
        rooms[name] = state.homeowner.rooms[name] ?? initialRoom();
      });
      return {
        ...state,
        homeowner: { ...state.homeowner, selectedRooms: action.payload, rooms, currentRoomIndex: 0 },
      };
    }
    case "HO_SET_ADDITIONAL_BEDROOMS":
      return { ...state, homeowner: { ...state.homeowner, additionalBedrooms: action.payload } };

    case "HO_SET_CURRENT_ROOM":
      return { ...state, homeowner: { ...state.homeowner, currentRoomIndex: action.payload } };

    case "HO_UPDATE_ROOM": {
      const { roomName, updates } = action.payload;
      return {
        ...state,
        homeowner: {
          ...state.homeowner,
          rooms: {
            ...state.homeowner.rooms,
            [roomName]: { ...(state.homeowner.rooms[roomName] ?? initialRoom()), ...updates },
          },
        },
      };
    }
    case "HO_SET_FLO":
      return { ...state, homeowner: { ...state.homeowner, floRecommendations: action.payload } };

    // ── Landlord ───────────────────────────────────────────────────
    case "LL_UPDATE":
      return { ...state, landlord: { ...state.landlord, ...action.payload } };

    case "LL_SET_ROOMS": {
      const rooms = {};
      action.payload.forEach((name) => {
        rooms[name] = state.landlord.rooms[name] ?? initialRoom();
      });
      return {
        ...state,
        landlord: { ...state.landlord, selectedRooms: action.payload, rooms },
      };
    }
    case "LL_UPDATE_ROOM": {
      const { roomName, updates } = action.payload;
      return {
        ...state,
        landlord: {
          ...state.landlord,
          rooms: {
            ...state.landlord.rooms,
            [roomName]: { ...(state.landlord.rooms[roomName] ?? initialRoom()), ...updates },
          },
        },
      };
    }
    case "LL_SET_FLO":
      return { ...state, landlord: { ...state.landlord, floRecommendations: action.payload } };

    // ── Commercial ─────────────────────────────────────────────────
    case "CM_UPDATE":
      return { ...state, commercial: { ...state.commercial, ...action.payload } };

    case "CM_UPDATE_CONTACT":
      return {
        ...state,
        commercial: {
          ...state.commercial,
          contact: { ...state.commercial.contact, ...action.payload },
        },
      };

    // ── Public Sector ──────────────────────────────────────────────
    case "PS_ADD_MESSAGE":
      return {
        ...state,
        publicSector: {
          ...state.publicSector,
          conversation: [...state.publicSector.conversation, action.payload],
        },
      };
    case "PS_SET_SUMMARY":
      return { ...state, publicSector: { ...state.publicSector, summary: action.payload } };
    case "PS_UPDATE_CONTACT":
      return {
        ...state,
        publicSector: {
          ...state.publicSector,
          contact: { ...state.publicSector.contact, ...action.payload },
        },
      };
    case "PS_SET_SUBMITTED":
      return { ...state, publicSector: { ...state.publicSector, submitted: true } };

    // ── Estimate ───────────────────────────────────────────────────
    case "SET_ESTIMATE":
      return { ...state, estimate: action.payload };

    default:
      return state;
  }
}

const QuoteFormContext = createContext(null);

export function QuoteFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setCustomerType = useCallback((t) => dispatch({ type: "SET_CUSTOMER_TYPE", payload: t }), []);
  const setStep = useCallback((s) => dispatch({ type: "SET_STEP", payload: s }), []);

  return (
    <QuoteFormContext.Provider value={{ state, dispatch, setCustomerType, setStep }}>
      {children}
    </QuoteFormContext.Provider>
  );
}

export function useQuoteForm() {
  const ctx = useContext(QuoteFormContext);
  if (!ctx) throw new Error("useQuoteForm must be used within QuoteFormProvider");
  return ctx;
}

// ── Pricing (client-side estimate) ─────────────────────────────────────────
const RATE = {
  Carpet:   { low: 22, high: 38 },
  LVT:      { low: 30, high: 52 },
  Laminate: { low: 22, high: 40 },
  Vinyl:    { low: 18, high: 35 },
  default:  { low: 22, high: 40 },
};

export function computeEstimate(rooms) {
  let low = 0, high = 0;
  Object.values(rooms).forEach((r) => {
    const area = r.dimensions?.area ?? 0;
    if (area <= 0) return;
    const rate = RATE[r.flooringType] ?? RATE.default;
    low  += area * rate.low;
    high += area * rate.high;
  });
  if (low + high === 0) return null;
  return { low: Math.max(250, Math.round(low / 10) * 10), high: Math.round(high / 10) * 10 };
}
