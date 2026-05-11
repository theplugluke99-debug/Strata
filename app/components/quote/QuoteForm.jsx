"use client";
import { useQuoteForm } from "./QuoteFormProvider";
import LaneSelector from "./LaneSelector";
import HomeownerFlow from "./homeowner/HomeownerFlow";
import LandlordFlow from "./landlord/LandlordFlow";
import CommercialFlow from "./commercial/CommercialFlow";
import PublicSectorChat from "./publicsector/PublicSectorChat";
import { BG } from "./tokens";

export default function QuoteForm() {
  const { state, setCustomerType } = useQuoteForm();
  const { customerType } = state;

  const back = () => setCustomerType(null);

  return (
    <div style={{ background: BG, minHeight: "100dvh", fontFamily: "system-ui, sans-serif" }}>
      {!customerType && <LaneSelector />}
      {customerType === "homeowner"    && <HomeownerFlow    onBackToLanes={back} />}
      {customerType === "landlord"     && <LandlordFlow     onBackToLanes={back} />}
      {customerType === "commercial"   && <CommercialFlow   onBackToLanes={back} />}
      {customerType === "publicSector" && <PublicSectorChat onBackToLanes={back} />}
    </div>
  );
}
