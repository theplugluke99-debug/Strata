"use client";

import { useMemo, useState } from "react";
import { brand, configuratorRooms, floRoomCopy } from "../../lib/brand";
import CommercialVisualiser from "./CommercialVisualiser";
import FloGuide from "./FloGuide";
import HouseVisualiser from "./HouseVisualiser";
import MagicButton from "./MagicButton";
import ProgressHeader from "./ProgressHeader";
import PropertySelector from "./PropertySelector";
import RoomSelector from "./RoomSelector";

const commercialDefault = "Good choice. We'll make sure this area is specified properly.";

export default function Shell() {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [floText, setFloText] = useState("Tell me what kind of space this is, and I'll guide the next step.");

  const roomOptions = propertyType ? configuratorRooms[propertyType] : [];
  const canContinue = step === 1 ? !!propertyType : step === 2 ? selectedRooms.length > 0 : false;

  const title = useMemo(() => {
    if (step === 1) return "Is this for your home or a commercial space?";
    if (step === 2) return propertyType === "Commercial" ? "Which areas need new flooring?" : "Which rooms need new flooring?";
    return "Next: measurements";
  }, [propertyType, step]);

  const handlePropertySelect = (type) => {
    setPropertyType(type);
    setSelectedRooms([]);
    setBedroomCount(1);
    setFloText(type === "Residential"
      ? "Perfect. Let's build your home floor by floor."
      : "Perfect. Let's map your space properly.");
  };

  const handleRoomToggle = (room) => {
    setSelectedRooms(prev => {
      const exists = prev.includes(room);
      const next = exists ? prev.filter(item => item !== room) : [...prev, room];
      if (!exists) setFloText(propertyType === "Commercial" ? commercialDefault : (floRoomCopy[room] || "Good choice. We'll make sure this room is specified properly."));
      else setFloText(next.length ? `${next.length} ${propertyType === "Commercial" ? "areas" : "rooms"} selected. We can keep shaping this together.` : "No rush. Choose the spaces that matter most.");
      return next;
    });
  };

  const handleBedroomCountChange = (nextCount) => {
    const count = Math.max(1, Math.min(5, nextCount));
    setBedroomCount(count);
    setSelectedRooms(prev => prev.includes("Bedroom") ? prev : [...prev, "Bedroom"]);
    setFloText(count === 1
      ? "A single-level home can feel beautifully calm when every room flows well."
      : `${count} bedrooms. We'll let the upstairs grow naturally around the landing.`);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    setStep(prev => Math.min(prev + 1, 3));
    if (step === 1) {
      setFloText(propertyType === "Commercial" ? "Now choose every area we should include." : "Now choose every room we should include.");
    }
    if (step === 2) {
      setFloText("Lovely. Measurements come next, so the estimate can feel properly grounded.");
    }
  };

  return (
    <main className="configure-shell">
      <ProgressHeader step={step} propertyType={propertyType} selectedCount={selectedRooms.length} />

      <section className="configure-stage">
        <div className="stage-copy">
          <p className="eyebrow">Strata Configure</p>
          <h1>{title}</h1>
          {step < 3 && <p className="stage-sub">A guided flooring design experience, shaped around your real space.</p>}
        </div>

        {step === 1 && (
          <PropertySelector selected={propertyType} onSelect={handlePropertySelect} />
        )}

        {step === 2 && (
          <>
            <div className="visualiser-frame">
              {propertyType === "Commercial" ? (
                <CommercialVisualiser selectedAreas={selectedRooms} assemblyStage={step} />
              ) : (
                <HouseVisualiser selectedRooms={selectedRooms} bedroomCount={bedroomCount} assemblyStage={step} />
              )}
            </div>
            <RoomSelector
              label={propertyType === "Commercial" ? "Selected areas" : "Selected rooms"}
              options={roomOptions}
              selected={selectedRooms}
              onToggle={handleRoomToggle}
              bedroomCount={propertyType === "Residential" ? bedroomCount : undefined}
              onBedroomCountChange={propertyType === "Residential" ? handleBedroomCountChange : undefined}
            />
          </>
        )}

        {step === 3 && (
          <div className="placeholder-step">
            <div>Next: measurements</div>
            <p>We'll add room measurements here next.</p>
          </div>
        )}

        <FloGuide message={floText} />
      </section>

      {step < 3 && (
        <div className={`continue-wrap ${canContinue ? "show" : ""}`}>
          <MagicButton disabled={!canContinue} onClick={handleContinue}>
            Continue
          </MagicButton>
        </div>
      )}

      <style>{`
        html, body { background: ${brand.bg} !important; }
        .configure-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 72% 12%, rgba(201,169,110,0.14), transparent 28%),
            radial-gradient(circle at 18% 76%, rgba(201,169,110,0.08), transparent 30%),
            ${brand.bg};
          color: ${brand.text};
          font-family: ${brand.sans};
          padding: 18px 16px 96px;
          overflow-x: hidden;
        }
        .configure-stage {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }
        .stage-copy {
          text-align: left;
          padding-top: 22px;
        }
        .eyebrow {
          color: ${brand.gold};
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        h1 {
          font-family: ${brand.serif};
          font-size: clamp(30px, 8vw, 76px);
          line-height: 0.95;
          letter-spacing: 0;
          margin: 0;
          font-weight: 600;
          max-width: min(820px, 100%);
        }
        .stage-sub {
          max-width: 540px;
          color: ${brand.dim};
          font-size: 14px;
          line-height: 1.65;
          margin: 14px 0 0;
        }
        .visualiser-frame {
          background: linear-gradient(145deg, rgba(26,26,24,0.86), rgba(17,17,16,0.8));
          border: 1px solid rgba(201,169,110,0.16);
          border-radius: 18px;
          padding: 10px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.38), inset 0 1px 0 rgba(242,237,224,0.04);
        }
        .placeholder-step {
          min-height: 280px;
          display: grid;
          place-content: center;
          text-align: center;
          border: 1px solid rgba(201,169,110,0.18);
          background: rgba(26,26,24,0.72);
          border-radius: 18px;
          padding: 28px;
        }
        .placeholder-step div {
          font-family: ${brand.serif};
          color: ${brand.gold};
          font-size: 42px;
          line-height: 1;
        }
        .placeholder-step p {
          color: ${brand.dim};
          margin: 12px 0 0;
        }
        .continue-wrap {
          position: fixed;
          left: 16px;
          right: 16px;
          bottom: 16px;
          z-index: 20;
          pointer-events: none;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.25s, transform 0.25s;
        }
        .continue-wrap.show {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        @media (min-width: 760px) {
          .configure-shell { padding: 28px 28px 110px; }
          .configure-stage { gap: 22px; }
          .stage-copy { text-align: center; display: grid; justify-items: center; }
          .continue-wrap {
            left: auto;
            right: max(28px, calc((100vw - 1120px) / 2));
            width: 260px;
          }
        }
      `}</style>
    </main>
  );
}
