"use client";
import { useState, useRef, useCallback } from "react";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "#a09880";

const FLOORING_CATEGORIES = [
  {
    label: "SOFT FLOORING",
    items: [
      "Carpet — broadloom",
      "Carpet — carpet tiles",
      "Carpet — stair carpet",
      "Carpet — bedroom",
      "Carpet — commercial/contract",
    ],
  },
  {
    label: "HARD FLOORING",
    items: [
      "LVT — click system",
      "LVT — glue down",
      "Luxury Vinyl Plank (LVP)",
      "SPC rigid core",
      "WPC core flooring",
      "Laminate",
      "Engineered wood",
      "Solid hardwood",
      "Parquet",
      "Herringbone — wood effect",
      "Chevron — wood effect",
      "Bamboo flooring",
    ],
  },
  {
    label: "STONE & TILE",
    items: [
      "Ceramic tiles",
      "Porcelain tiles",
      "Natural stone (slate, travertine, marble)",
      "Mosaic tiles",
      "Porcelain large format slabs",
    ],
  },
  {
    label: "SPECIALIST",
    items: [
      "Rubber flooring",
      "Cork flooring",
      "Resin flooring",
      "Epoxy flooring",
      "Safety flooring",
      "Acoustic underlay specialist",
      "Underfloor heating systems",
    ],
  },
  {
    label: "COMMERCIAL",
    items: [
      "Commercial carpet tiles",
      "Entrance matting systems",
      "Sports flooring",
      "Anti-static flooring",
    ],
  },
];

const PHOTO_CATEGORIES = [
  {
    id: "overview",
    label: "Category 1 — Finished work overview",
    min: 3,
    desc: "Wide shots of completed rooms showing full floor, skirting edges, door bars",
  },
  {
    id: "detail",
    label: "Category 2 — Detail shots",
    min: 2,
    desc: "Close ups of seams, edges at skirting boards, door bar finishes",
  },
  {
    id: "pattern",
    label: "Category 3 — Pattern work if applicable",
    min: 0,
    desc: "Herringbone, chevron, pattern matching",
  },
  {
    id: "stairs",
    label: "Category 4 — Stairs if applicable",
    min: 0,
    desc: "Top, middle, bottom of completed staircase",
  },
];

function Input({ label, hint, ...props }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 6, fontFamily: "system-ui" }}>
        {label}
      </label>
      {hint && <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 6, fontFamily: "system-ui" }}>{hint}</p>}
      <input
        {...props}
        style={{
          width: "100%",
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "12px 14px",
          color: TEXT,
          fontSize: 15,
          fontFamily: "system-ui",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => { e.target.style.borderColor = GOLD; if (props.onFocus) props.onFocus(e); }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; if (props.onBlur) props.onBlur(e); }}
      />
    </div>
  );
}

function Textarea({ label, hint, ...props }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 6, fontFamily: "system-ui" }}>
        {label}
      </label>
      {hint && <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 6, fontFamily: "system-ui" }}>{hint}</p>}
      <textarea
        {...props}
        rows={3}
        style={{
          width: "100%",
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "12px 14px",
          color: TEXT,
          fontSize: 15,
          fontFamily: "system-ui",
          outline: "none",
          boxSizing: "border-box",
          resize: "vertical",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => { e.target.style.borderColor = GOLD; if (props.onFocus) props.onFocus(e); }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; if (props.onBlur) props.onBlur(e); }}
      />
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 10, fontFamily: "system-ui" }}>
        {label}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: `1px solid ${value === opt ? GOLD : BORDER}`,
              background: value === opt ? "rgba(201,169,110,0.12)" : SURFACE,
              color: value === opt ? GOLD : TEXT_MUTED,
              fontSize: 14,
              fontFamily: "system-ui",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoUploadZone({ category, photos, onAdd }) {
  const inputRef = useRef();
  const count = photos.length;
  const met = count >= category.min;

  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => onAdd(category.id, e.target.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ color: GOLD, fontSize: 13, fontFamily: "system-ui", fontWeight: 600 }}>{category.label}</span>
        {category.min > 0 && (
          <span style={{
            fontSize: 12, padding: "2px 8px", borderRadius: 20,
            background: met ? "rgba(100,200,100,0.15)" : "rgba(201,169,110,0.12)",
            color: met ? "#6ec97a" : GOLD, fontFamily: "system-ui",
          }}>
            {count}/{category.min} min
          </span>
        )}
      </div>
      <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 10, fontFamily: "system-ui" }}>{category.desc}</p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${BORDER}`,
          borderRadius: 10,
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s",
          background: "rgba(201,169,110,0.03)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
        {count > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {photos.map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6, border: `1px solid ${BORDER}` }} />
            ))}
            <div style={{ width: 70, height: 70, borderRadius: 6, border: `1px dashed ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontSize: 24 }}>+</div>
          </div>
        ) : (
          <p style={{ color: TEXT_MUTED, fontSize: 14, fontFamily: "system-ui", margin: 0 }}>Tap or drag photos here</p>
        )}
      </div>
    </div>
  );
}

const STEPS = ["Personal details", "Trade details", "Portfolio", "Agreement", "Done"];

export default function FitterApply() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: "", tradingName: "", companiesHouseNumber: "", mobile: "",
    email: "", homePostcode: "", areasCovered: "", socialMedia: "",
    flooringTypes: [], yearsExperience: "", worksSoloOrTeam: "",
    hasOwnVan: "", hasInsurance: "", insuranceCertificate: "",
    photos: { overview: [], detail: [], pattern: [], stairs: [] },
    agreed: false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleFlooring = (item) => {
    set("flooringTypes", form.flooringTypes.includes(item)
      ? form.flooringTypes.filter((x) => x !== item)
      : [...form.flooringTypes, item]
    );
  };

  const addPhoto = useCallback((catId, dataUrl) => {
    setForm((f) => ({ ...f, photos: { ...f.photos, [catId]: [...f.photos[catId], dataUrl] } }));
  }, []);

  const totalPhotos = Object.values(form.photos).flat().length;
  const photosValid = form.photos.overview.length >= 3 && form.photos.detail.length >= 2 && totalPhotos >= 8;

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!form.mobile.trim()) e.mobile = "Mobile number is required";
      if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email is required";
      if (!form.homePostcode.trim()) e.homePostcode = "Postcode is required";
      if (!form.areasCovered.trim()) e.areasCovered = "Please list the areas you cover";
    }
    if (step === 2) {
      if (form.flooringTypes.length === 0) e.flooringTypes = "Please select at least one flooring type";
      if (!form.yearsExperience) e.yearsExperience = "Please select your experience level";
      if (!form.worksSoloOrTeam) e.worksSoloOrTeam = "Please select how you work";
      if (!form.hasOwnVan) e.hasOwnVan = "Please answer this";
      if (!form.hasInsurance) e.hasInsurance = "Please answer this";
    }
    if (step === 3) {
      if (!photosValid) e.photos = "Please upload at least 8 photos (3 overview + 2 detail)";
    }
    if (step === 4) {
      if (!form.agreed) e.agreed = "Please agree to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const allPhotos = Object.values(form.photos).flat();
      const res = await fetch("/api/fitter/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          portfolioPhotos: `${allPhotos.length} photos submitted`,
          insuranceCertificate: form.insuranceCertificate ? "Certificate uploaded" : "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReference(data.data.reference);
        setStep(5);
        await fetch("/api/fitter/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.fullName, email: form.email }),
        });
      } else {
        setErrors({ submit: "Something went wrong. Please try again." });
      }
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontFamily: "system-ui" }}>STRATA TRADE</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 400, color: TEXT, margin: "0 0 8px" }}>
            Apply to fit with Strata
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: 15, margin: 0 }}>
            If your work is good and you&apos;re reliable, there&apos;s a place for you here.
          </p>
        </div>

        {/* Progress bar */}
        {step < 5 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              {STEPS.slice(0, 4).map((label, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: step > i + 1 ? GOLD : step === i + 1 ? "rgba(201,169,110,0.2)" : "transparent",
                    border: `2px solid ${step >= i + 1 ? GOLD : BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: step > i + 1 ? BG : step === i + 1 ? GOLD : TEXT_MUTED,
                    fontSize: 13, fontWeight: 600, marginBottom: 6,
                    transition: "all 0.3s",
                  }}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 11, color: step === i + 1 ? GOLD : TEXT_MUTED, fontFamily: "system-ui", textAlign: "center" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ height: 3, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: GOLD, width: `${((step - 1) / 4) * 100}%`, transition: "width 0.4s ease", borderRadius: 2 }} />
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 8 }}>About you</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>All straightforward — takes about 3 minutes.</p>
            <Input label="Full legal name *" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="As it appears on your ID" />
            {errors.fullName && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.fullName}</p>}
            <Input label="Trading name or business name" value={form.tradingName} onChange={(e) => set("tradingName", e.target.value)} placeholder="Optional" />
            <Input label="Companies House number" hint="Limited company? Add your CH number — we verify automatically" value={form.companiesHouseNumber} onChange={(e) => set("companiesHouseNumber", e.target.value)} placeholder="Optional" />
            <Input label="Mobile number *" type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="07xxx xxxxxx" />
            {errors.mobile && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.mobile}</p>}
            <Input label="Email address *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            {errors.email && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.email}</p>}
            <Input label="Home postcode *" value={form.homePostcode} onChange={(e) => set("homePostcode", e.target.value)} placeholder="e.g. RM7 0AA" />
            {errors.homePostcode && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.homePostcode}</p>}
            <Textarea label="Areas willing to cover *" value={form.areasCovered} onChange={(e) => set("areasCovered", e.target.value)} placeholder="e.g. RM, E, IG, CM — add as many as you cover" />
            {errors.areasCovered && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.areasCovered}</p>}
            <Input label="Instagram, TikTok or Facebook" hint="Show us your work online if you have it" value={form.socialMedia} onChange={(e) => set("socialMedia", e.target.value)} placeholder="Optional — link or handle" />
            <button onClick={next} style={{ width: "100%", padding: "16px", background: GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, fontFamily: "system-ui", cursor: "pointer", marginTop: 8 }}>
              Continue
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 8 }}>Your trade</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>Tell us what you do best.</p>

            <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 12, fontFamily: "system-ui" }}>Flooring types you fit *</label>
            {errors.flooringTypes && <p style={{ color: "#e07070", fontSize: 13, marginBottom: 12 }}>{errors.flooringTypes}</p>}

            {FLOORING_CATEGORIES.map((cat) => (
              <div key={cat.label} style={{ marginBottom: 24 }}>
                <p style={{ color: GOLD, fontSize: 11, letterSpacing: 2, fontFamily: "system-ui", marginBottom: 10, fontWeight: 600 }}>{cat.label}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cat.items.map((item) => {
                    const checked = form.flooringTypes.includes(item);
                    return (
                      <label key={item} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 12px", borderRadius: 8, background: checked ? "rgba(201,169,110,0.08)" : "transparent", border: `1px solid ${checked ? GOLD : BORDER}`, transition: "all 0.2s" }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 4,
                          border: `2px solid ${checked ? GOLD : BORDER}`,
                          background: checked ? GOLD : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "all 0.2s",
                        }}>
                          {checked && <span style={{ color: BG, fontSize: 12, fontWeight: 700 }}>✓</span>}
                        </div>
                        <input type="checkbox" checked={checked} onChange={() => toggleFlooring(item)} style={{ display: "none" }} />
                        <span style={{ color: TEXT, fontSize: 14 }}>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <RadioGroup label="Years experience *" options={["Under 2", "2-5", "5-10", "10+"]} value={form.yearsExperience} onChange={(v) => set("yearsExperience", v)} />
            {errors.yearsExperience && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.yearsExperience}</p>}
            <RadioGroup label="Works solo or team *" options={["Solo", "Small team 2-3", "Larger crew"]} value={form.worksSoloOrTeam} onChange={(v) => set("worksSoloOrTeam", v)} />
            {errors.worksSoloOrTeam && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.worksSoloOrTeam}</p>}
            <RadioGroup label="Own van *" options={["Yes", "No"]} value={form.hasOwnVan} onChange={(v) => set("hasOwnVan", v)} />
            {errors.hasOwnVan && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.hasOwnVan}</p>}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 12, fontFamily: "system-ui" }}>Public liability insurance *</label>
              {["Yes (upload certificate)", "Getting it sorted", "No"].map((opt) => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.hasInsurance === opt ? GOLD : BORDER}`, background: form.hasInsurance === opt ? GOLD : "transparent", flexShrink: 0, transition: "all 0.2s" }} />
                  <input type="radio" name="insurance" value={opt} checked={form.hasInsurance === opt} onChange={() => set("hasInsurance", opt)} style={{ display: "none" }} />
                  <span style={{ color: TEXT, fontSize: 14 }}>{opt}</span>
                </label>
              ))}
              {errors.hasInsurance && <p style={{ color: "#e07070", fontSize: 13 }}>{errors.hasInsurance}</p>}
              {form.hasInsurance === "Yes (upload certificate)" && (
                <div style={{ marginTop: 12 }}>
                  <input
                    type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => set("insuranceCertificate", ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ color: TEXT_MUTED, fontSize: 14 }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={back} style={{ flex: 1, padding: "16px", background: "transparent", color: TEXT_MUTED, borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 16, fontFamily: "system-ui", cursor: "pointer" }}>Back</button>
              <button onClick={next} style={{ flex: 2, padding: "16px", background: GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, fontFamily: "system-ui", cursor: "pointer" }}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 8 }}>Your portfolio</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 8 }}>
              These photos are your first impression. Show us your best work — we&apos;re looking for clean edges, neat finishes, and attention to detail.
            </p>
            <div style={{ background: "rgba(201,169,110,0.07)", border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 10, padding: "12px 16px", marginBottom: 28 }}>
              <p style={{ color: GOLD, fontSize: 13, margin: 0, fontFamily: "system-ui" }}>
                Minimum 8 photos total — at least 3 overview shots and 2 detail shots required.
              </p>
            </div>

            {PHOTO_CATEGORIES.map((cat) => (
              <PhotoUploadZone key={cat.id} category={cat} photos={form.photos[cat.id]} onAdd={addPhoto} />
            ))}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, padding: "12px 16px", background: SURFACE, borderRadius: 10, border: `1px solid ${BORDER}` }}>
              <span style={{ color: TEXT_MUTED, fontSize: 14 }}>Total photos uploaded</span>
              <span style={{ color: totalPhotos >= 8 ? "#6ec97a" : GOLD, fontSize: 18, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}>{totalPhotos}</span>
            </div>

            {errors.photos && <p style={{ color: "#e07070", fontSize: 13, marginBottom: 16 }}>{errors.photos}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={back} style={{ flex: 1, padding: "16px", background: "transparent", color: TEXT_MUTED, borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 16, fontFamily: "system-ui", cursor: "pointer" }}>Back</button>
              <button onClick={next} style={{ flex: 2, padding: "16px", background: GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, fontFamily: "system-ui", cursor: "pointer" }}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 8 }}>How we work together</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>Take a moment with this. It matters to us.</p>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px", marginBottom: 28 }}>
              {[
                "By joining Strata you're agreeing to a few things that protect everyone in the network including you.",
                "You'll show up when you say you will. If something comes up and you can't make a job, you'll tell us as early as possible so we can sort it for the customer.",
                "You'll do the work to the standard you'd want done in your own home.",
                "You'll upload a minimum of 8 photos on every job — before and after. We know it feels like a lot. But it's the thing that protects you when a customer tries to claim something that isn't true. Your photos are your evidence. We're on your side.",
                "You'll treat every customer with respect regardless of the job size.",
                "We'll pay you within 48 hours of customer sign off, every time, no exceptions.",
                "We won't take a cut of your tools, your van, your time outside of Strata jobs. What you do outside of Strata is your business.",
                "We're on your side. We want you earning consistently and fairly. If something isn't working, talk to us.",
              ].map((para, i) => (
                <p key={i} style={{ color: TEXT, fontSize: 15, lineHeight: 1.7, marginBottom: i < 7 ? 16 : 0, fontFamily: "system-ui" }}>{para}</p>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", marginBottom: 28, padding: "16px", background: form.agreed ? "rgba(201,169,110,0.08)" : SURFACE, border: `1px solid ${form.agreed ? GOLD : BORDER}`, borderRadius: 10, transition: "all 0.2s" }}>
              <div onClick={() => set("agreed", !form.agreed)} style={{
                width: 24, height: 24, borderRadius: 6, border: `2px solid ${form.agreed ? GOLD : BORDER}`,
                background: form.agreed ? GOLD : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 2, transition: "all 0.2s",
              }}>
                {form.agreed && <span style={{ color: BG, fontSize: 14, fontWeight: 700 }}>✓</span>}
              </div>
              <input type="checkbox" checked={form.agreed} onChange={() => set("agreed", !form.agreed)} style={{ display: "none" }} />
              <span style={{ color: form.agreed ? TEXT : TEXT_MUTED, fontSize: 15, lineHeight: 1.5, fontFamily: "system-ui" }}>
                I agree to work with Strata on these terms.
              </span>
            </label>

            {errors.agreed && <p style={{ color: "#e07070", fontSize: 13, marginBottom: 16 }}>{errors.agreed}</p>}
            {errors.submit && <p style={{ color: "#e07070", fontSize: 13, marginBottom: 16 }}>{errors.submit}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={back} style={{ flex: 1, padding: "16px", background: "transparent", color: TEXT_MUTED, borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 16, fontFamily: "system-ui", cursor: "pointer" }}>Back</button>
              <button onClick={submit} disabled={submitting} style={{ flex: 2, padding: "16px", background: submitting ? "rgba(201,169,110,0.5)" : GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, fontFamily: "system-ui", cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting..." : "Submit application"}
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Confirmation */}
        {step === 5 && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,169,110,0.15)", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 28 }}>✓</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 400, color: TEXT, marginBottom: 16 }}>
              Thanks {form.fullName.split(" ")[0]}.
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
              We&apos;ve got your application and we&apos;ll be in touch within 24 hours. We&apos;re not here to make this difficult — if your work is good and you&apos;re reliable, you&apos;re in.
            </p>
            {reference && (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 24px", display: "inline-block" }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 4, fontFamily: "system-ui" }}>Your reference</p>
                <p style={{ color: GOLD, fontSize: 22, fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0, letterSpacing: 1 }}>{reference}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
