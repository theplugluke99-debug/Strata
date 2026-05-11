"use client";
import { useState, useEffect } from "react";
import { useQuoteForm } from "../QuoteFormProvider";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER, btn, btnGhost } from "../tokens";
import BackButton from "../shared/BackButton";
import ProgressDots from "../shared/ProgressDots";

const BUSINESS_TYPES = ["Office", "Hospitality", "Healthcare", "Retail", "Education", "Gym / Leisure", "Other"];
const FOOTFALL = ["Low", "Medium", "High"];
const EXISTING_FLOOR = ["Full replacement", "Partial", "New build"];
const TIMELINES = ["ASAP", "Within 1 month", "1–3 months", "Planning stage"];
const REQUIREMENTS = [
  { id: "slip",     label: "Slip resistance rating required" },
  { id: "fire",     label: "Fire rating required" },
  { id: "acoustic", label: "Acoustic performance required" },
  { id: "warranty", label: "Warranty documentation required" },
  { id: "ooh",      label: "Out of hours installation required" },
];

function ChipRow({ options, value, onSelect, multi = false }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = multi ? (value ?? []).includes(opt.id ?? opt) : value === (opt.id ?? opt);
        return (
          <button
            key={opt.id ?? opt}
            onClick={() => {
              if (multi) {
                const id = opt.id ?? opt;
                const arr = value ?? [];
                onSelect(active ? arr.filter((x) => x !== id) : [...arr, id]);
              } else {
                onSelect(opt.id ?? opt);
              }
            }}
            style={{
              background: active ? GOLD_DIM : SURFACE,
              border: `1px solid ${active ? GOLD : BORDER}`,
              borderRadius: 8, padding: "10px 18px",
              color: active ? TEXT : MUTED,
              fontFamily: "var(--font-outfit)", fontSize: 14,
              fontWeight: active ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {opt.label ?? opt}
          </button>
        );
      })}
    </div>
  );
}

function FloProposalStep({ onBack, onSubmit }) {
  const { state, dispatch } = useQuoteForm();
  const cm = state.commercial;
  const [loading, setLoading] = useState(!cm.floProposal);
  const [contact, setContact] = useState(cm.contact);

  useEffect(() => {
    if (cm.floProposal) { setLoading(false); return; }
    fetch("/api/flo/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        laneType: "commercial",
        context: {
          businessType: cm.businessType,
          squareMeterage: cm.squareMeterage,
          footfallLevel: cm.footfallLevel,
          existingFloor: cm.existingFloor,
          timeline: cm.timeline,
          requirements: cm.requirements,
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => { dispatch({ type: "CM_UPDATE", payload: { floProposal: d.proposal ?? d } }); setLoading(false); })
      .catch(() => { dispatch({ type: "CM_UPDATE", payload: { floProposal: { text: "Please get in touch and we'll put together a tailored proposal within 24 hours." } } }); setLoading(false); });
  }, []);

  const updateContact = (field, val) => {
    const updated = { ...contact, [field]: val };
    setContact(updated);
    dispatch({ type: "CM_UPDATE_CONTACT", payload: updated });
  };

  const inputStyle = {
    background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8,
    color: TEXT, fontFamily: "var(--font-outfit)", fontSize: 15, padding: "13px 16px",
    width: "100%", outline: "none",
  };

  const allFilled = contact.name && contact.email && contact.phone && contact.postcode;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0" }}><BackButton onClick={onBack} /></div>
      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "28px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="2.5" stroke={GOLD} strokeWidth="1.2"/>
              <path d="M2 14C2 11 4.7 9 8 9C11.3 9 14 11 14 14" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ color: GOLD, fontFamily: "var(--font-outfit)", fontSize: 12, fontWeight: 600 }}>Flo</span>
        </div>

        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(22px,4vw,34px)", color: TEXT, margin: "0 0 8px" }}>
          Your commercial proposal
        </h2>
        <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 13, margin: "0 0 24px", lineHeight: 1.6 }}>
          Commercial projects are individually quoted. We'll have a full proposal to you within 24 hours.
        </p>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: GOLD, fontFamily: "var(--font-outfit)", fontSize: 13 }}>
            Flo is reviewing your brief…
          </div>
        ) : (
          cm.floProposal && (
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
              <p style={{ color: TEXT, fontFamily: "var(--font-outfit)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {cm.floProposal.text ?? cm.floProposal.summary ?? JSON.stringify(cm.floProposal)}
              </p>
            </div>
          )
        )}

        {/* Contact form */}
        <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Your details</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            { key: "name",    placeholder: "Your name" },
            { key: "company", placeholder: "Company name" },
            { key: "email",   placeholder: "Email address" },
            { key: "phone",   placeholder: "Phone number" },
            { key: "postcode",placeholder: "Project postcode" },
          ].map(({ key, placeholder }) => (
            <input
              key={key}
              type={key === "email" ? "email" : "text"}
              placeholder={placeholder}
              value={contact[key] ?? ""}
              onChange={(e) => updateContact(key, e.target.value)}
              style={inputStyle}
            />
          ))}
        </div>

        <button
          onClick={onSubmit}
          disabled={!allFilled}
          style={{ ...btn, width: "100%", padding: "16px", fontSize: 16, opacity: allFilled ? 1 : 0.35 }}
        >
          Request a commercial proposal →
        </button>
      </div>
    </div>
  );
}

export default function CommercialFlow({ onBackToLanes }) {
  const { state, dispatch } = useQuoteForm();
  const { step } = state;
  const cm = state.commercial;

  const goStep = (s) => dispatch({ type: "SET_STEP", payload: s });
  const update = (payload) => dispatch({ type: "CM_UPDATE", payload });

  const handleSubmit = async () => {
    const ref = `STR-${Date.now().toString(36).toUpperCase()}`;
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_number: ref,
        customer_type: "commercial",
        lane_flag: "urgent",
        business_type: cm.businessType,
        total_m2: parseFloat(cm.squareMeterage) || 0,
        footfall_level: cm.footfallLevel,
        existing_floor: cm.existingFloor,
        timeline: cm.timeline,
        special_requirements: cm.requirements.join(", "),
        name: cm.contact.name,
        company: cm.contact.company,
        email: cm.contact.email,
        phone: cm.contact.phone,
        postcode: cm.contact.postcode,
        status: "New",
      }),
    });
    goStep(99);
  };

  if (step === 99) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: 36, color: "#f2ede0", margin: "0 0 12px" }}>Proposal incoming</h2>
      <p style={{ fontFamily: "var(--font-outfit)", fontSize: 15, color: "rgba(242,237,224,0.5)", maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
        We'll have a full commercial proposal with you within 24 hours.
      </p>
    </div>
  );

  const sectionLabel = (label) => (
    <div style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>{label}</div>
  );

  // ── Step 0: Business type ─────────────────────────────────────────
  if (step === 0) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={onBackToLanes} />
        <ProgressDots total={4} current={0} />
        <div style={{ width: 52 }} />
      </div>
      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(26px,5vw,40px)", color: TEXT, margin: "0 0 8px" }}>What type of business?</h2>
        <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 28px" }}>This shapes the specification Flo recommends.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 32 }}>
          {BUSINESS_TYPES.map((b) => (
            <button key={b} onClick={() => update({ businessType: b })} style={{
              background: cm.businessType === b ? GOLD_DIM : SURFACE,
              border: `1px solid ${cm.businessType === b ? GOLD : BORDER}`,
              borderRadius: 12, padding: "18px 16px", cursor: "pointer",
              color: cm.businessType === b ? TEXT : MUTED,
              fontFamily: "var(--font-outfit)", fontWeight: cm.businessType === b ? 600 : 400, fontSize: 15, transition: "all 0.2s",
            }}>{b}</button>
          ))}
        </div>
        <button onClick={() => goStep(1)} disabled={!cm.businessType} style={{ ...btn, width: "100%", padding: "16px", fontSize: 16, opacity: cm.businessType ? 1 : 0.35 }}>
          Continue →
        </button>
      </div>
    </div>
  );

  // ── Step 1: Project details ───────────────────────────────────────
  if (step === 1) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={() => goStep(0)} />
        <ProgressDots total={4} current={1} />
        <div style={{ width: 52 }} />
      </div>
      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(26px,5vw,40px)", color: TEXT, margin: "0 0 32px" }}>Project details</h2>
        {sectionLabel("Approximate square meterage")}
        <input
          type="number"
          placeholder="e.g. 450"
          value={cm.squareMeterage}
          onChange={(e) => update({ squareMeterage: e.target.value })}
          style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT, fontFamily: "var(--font-outfit)", fontSize: 22, fontWeight: 500, padding: "16px 20px", width: "100%", outline: "none", marginBottom: 28 }}
        />
        {sectionLabel("Footfall level")}
        <div style={{ marginBottom: 28 }}><ChipRow options={FOOTFALL} value={cm.footfallLevel} onSelect={(v) => update({ footfallLevel: v })} /></div>
        {sectionLabel("Existing floor")}
        <div style={{ marginBottom: 28 }}><ChipRow options={EXISTING_FLOOR} value={cm.existingFloor} onSelect={(v) => update({ existingFloor: v })} /></div>
        {sectionLabel("Timeline")}
        <div style={{ marginBottom: 32 }}><ChipRow options={TIMELINES} value={cm.timeline} onSelect={(v) => update({ timeline: v })} /></div>
        <button onClick={() => goStep(2)} disabled={!cm.squareMeterage || !cm.footfallLevel || !cm.existingFloor || !cm.timeline} style={{ ...btn, width: "100%", padding: "16px", fontSize: 16, opacity: cm.squareMeterage && cm.footfallLevel && cm.existingFloor && cm.timeline ? 1 : 0.35 }}>
          Continue →
        </button>
      </div>
    </div>
  );

  // ── Step 2: Requirements ──────────────────────────────────────────
  if (step === 2) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={() => goStep(1)} />
        <ProgressDots total={4} current={2} />
        <div style={{ width: 52 }} />
      </div>
      <div style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(26px,5vw,40px)", color: TEXT, margin: "0 0 8px" }}>Any specific requirements?</h2>
        <p style={{ color: MUTED, fontFamily: "var(--font-outfit)", fontSize: 14, margin: "0 0 28px" }}>Select all that apply.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {REQUIREMENTS.map((r) => {
            const active = cm.requirements.includes(r.id);
            return (
              <button key={r.id} onClick={() => {
                const reqs = cm.requirements;
                update({ requirements: active ? reqs.filter(x => x !== r.id) : [...reqs, r.id] });
              }} style={{
                background: active ? GOLD_DIM : SURFACE, border: `1px solid ${active ? GOLD : BORDER}`,
                borderRadius: 10, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s",
              }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${active ? GOLD : BORDER}`, background: active ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {active && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#111110" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ color: active ? TEXT : MUTED, fontFamily: "var(--font-outfit)", fontSize: 14 }}>{r.label}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => goStep(3)} style={{ ...btn, width: "100%", padding: "16px", fontSize: 16 }}>
          See Flo's recommendation →
        </button>
      </div>
    </div>
  );

  // ── Step 3: Flo proposal + contact ────────────────────────────────
  if (step === 3) return <FloProposalStep onBack={() => goStep(2)} onSubmit={handleSubmit} />;

  return null;
}
