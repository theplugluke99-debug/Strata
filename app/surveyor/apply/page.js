"use client";
import { useState } from "react";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "#a09880";

function Input({ label, hint, ...props }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 6, fontFamily: "system-ui" }}>{label}</label>
      {hint && <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 6, fontFamily: "system-ui" }}>{hint}</p>}
      <input
        {...props}
        style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 15, fontFamily: "system-ui", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
        onFocus={(e) => { e.target.style.borderColor = GOLD; if (props.onFocus) props.onFocus(e); }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; if (props.onBlur) props.onBlur(e); }}
      />
    </div>
  );
}

function Textarea({ label, hint, ...props }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 6, fontFamily: "system-ui" }}>{label}</label>
      {hint && <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 6, fontFamily: "system-ui" }}>{hint}</p>}
      <textarea
        {...props}
        rows={4}
        style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 15, fontFamily: "system-ui", outline: "none", boxSizing: "border-box", resize: "vertical", transition: "border-color 0.2s" }}
        onFocus={(e) => { e.target.style.borderColor = GOLD; if (props.onFocus) props.onFocus(e); }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; if (props.onBlur) props.onBlur(e); }}
      />
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 10, fontFamily: "system-ui" }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${value === opt ? GOLD : BORDER}`, background: value === opt ? "rgba(201,169,110,0.12)" : SURFACE, color: value === opt ? GOLD : TEXT_MUTED, fontSize: 14, fontFamily: "system-ui", cursor: "pointer", transition: "all 0.2s" }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, value, onChange }) {
  const toggle = (opt) => onChange(value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt]);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 10, fontFamily: "system-ui" }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => {
          const checked = value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${checked ? GOLD : BORDER}`, background: checked ? "rgba(201,169,110,0.12)" : SURFACE, color: checked ? GOLD : TEXT_MUTED, fontSize: 14, fontFamily: "system-ui", cursor: "pointer", transition: "all 0.2s" }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const STEPS = ["Personal details", "Background", "Agreement", "Done"];

export default function SurveyorApply() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState({});
  const [verifyState, setVerifyState] = useState("idle"); // idle | sent | verified
  const [verifyCode, setVerifyCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const [form, setForm] = useState({
    fullName: "", businessName: "", mobile: "", email: "",
    homePostcode: "", areasCovered: "", socialMedia: "",
    tradeExperience: "",
    comfortableMeasuring: "", comfortableWithApp: "", ownTransport: "",
    daysAvailable: [], hoursAvailable: [],
    agreed: false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const sendVerify = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerifyCode(code);
    setVerifyState("sent");
    console.log("[SMS verify code for", form.mobile, "]:", code);
  };

  const checkCode = () => {
    if (enteredCode === verifyCode) setVerifyState("verified");
    else setErrors((e) => ({ ...e, verify: "That code doesn't match. Try again." }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!form.mobile.trim()) e.mobile = "Mobile number is required";
      if (verifyState !== "verified") e.verify = "Please verify your mobile number";
      if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email is required";
      if (!form.homePostcode.trim()) e.homePostcode = "Postcode is required";
      if (!form.areasCovered.trim()) e.areasCovered = "Please list areas you can cover";
    }
    if (step === 2) {
      if (!form.comfortableMeasuring) e.comfortableMeasuring = "Please answer this";
      if (!form.comfortableWithApp) e.comfortableWithApp = "Please answer this";
      if (!form.ownTransport) e.ownTransport = "Please answer this";
      if (form.daysAvailable.length === 0) e.daysAvailable = "Please select at least one day";
      if (form.hoursAvailable.length === 0) e.hoursAvailable = "Please select your available hours";
    }
    if (step === 3) {
      if (!form.agreed) e.agreed = "Please agree to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (!validateStep()) return; setStep((s) => s + 1); window.scrollTo(0, 0); };
  const back = () => { setStep((s) => s - 1); window.scrollTo(0, 0); };

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/surveyor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setReference(data.data.reference);
        setStep(4);
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

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>STRATA TRADE</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 400, color: TEXT, margin: "0 0 8px" }}>
            Apply to survey with Strata
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: 15, margin: 0 }}>
            No sales. No pressure. Just helping people choose the right floor.
          </p>
        </div>

        {step < 4 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              {STEPS.slice(0, 3).map((label, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: step > i + 1 ? GOLD : step === i + 1 ? "rgba(201,169,110,0.2)" : "transparent", border: `2px solid ${step >= i + 1 ? GOLD : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: step > i + 1 ? BG : step === i + 1 ? GOLD : TEXT_MUTED, fontSize: 13, fontWeight: 600, marginBottom: 6, transition: "all 0.3s" }}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 11, color: step === i + 1 ? GOLD : TEXT_MUTED, textAlign: "center" }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 3, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: GOLD, width: `${((step - 1) / 3) * 100}%`, transition: "width 0.4s ease", borderRadius: 2 }} />
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 8 }}>About you</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>Quick and straightforward.</p>

            <Input label="Full legal name *" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="As it appears on your ID" />
            {errors.fullName && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.fullName}</p>}

            <Input label="Business name" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Optional" />

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: TEXT_MUTED, fontSize: 13, marginBottom: 6 }}>Mobile number *</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="07xxx xxxxxx"
                  style={{ flex: 1, background: SURFACE, border: `1px solid ${verifyState === "verified" ? "#6ec97a" : BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 15, outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = verifyState === "verified" ? "#6ec97a" : BORDER)}
                />
                {verifyState === "idle" && (
                  <button onClick={sendVerify} disabled={!form.mobile} style={{ padding: "12px 16px", background: form.mobile ? GOLD : BORDER, color: form.mobile ? BG : TEXT_MUTED, borderRadius: 8, border: "none", fontSize: 14, cursor: form.mobile ? "pointer" : "not-allowed", fontFamily: "system-ui", whiteSpace: "nowrap" }}>
                    Verify
                  </button>
                )}
                {verifyState === "verified" && <span style={{ padding: "12px 16px", color: "#6ec97a", fontSize: 14, fontFamily: "system-ui" }}>Verified ✓</span>}
              </div>
              {errors.mobile && <p style={{ color: "#e07070", fontSize: 13, marginTop: 6 }}>{errors.mobile}</p>}

              {verifyState === "sent" && (
                <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                  <input
                    value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} placeholder="6-digit code"
                    maxLength={6}
                    style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 15, outline: "none" }}
                  />
                  <button onClick={checkCode} style={{ padding: "10px 16px", background: GOLD, color: BG, borderRadius: 8, border: "none", fontSize: 14, cursor: "pointer" }}>Confirm</button>
                </div>
              )}
              {verifyState === "sent" && <p style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 8 }}>A 6-digit code has been sent to your mobile.</p>}
              {errors.verify && <p style={{ color: "#e07070", fontSize: 13, marginTop: 6 }}>{errors.verify}</p>}
            </div>

            <Input label="Email address *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            {errors.email && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.email}</p>}

            <Input label="Home postcode *" value={form.homePostcode} onChange={(e) => set("homePostcode", e.target.value)} placeholder="e.g. RM7 0AA" />
            {errors.homePostcode && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.homePostcode}</p>}

            <Textarea label="Areas willing to cover *" value={form.areasCovered} onChange={(e) => set("areasCovered", e.target.value)} placeholder="e.g. RM, E, IG, CM" />
            {errors.areasCovered && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.areasCovered}</p>}

            <Input label="Instagram or Facebook" value={form.socialMedia} onChange={(e) => set("socialMedia", e.target.value)} placeholder="Optional" />

            <button onClick={next} style={{ width: "100%", padding: "16px", background: GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, fontFamily: "system-ui", cursor: "pointer", marginTop: 8 }}>
              Continue
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 8 }}>A bit of background</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>None of this disqualifies you — we just want to understand where you&apos;re starting from.</p>

            <Textarea
              label="Any flooring or trade experience"
              hint="Not required at all — just helpful context. A few sentences is plenty."
              value={form.tradeExperience}
              onChange={(e) => set("tradeExperience", e.target.value)}
              placeholder="Optional"
            />

            <RadioGroup
              label="Comfortable measuring rooms with a tape measure *"
              options={["Yes", "Mostly", "Would need a quick guide"]}
              value={form.comfortableMeasuring}
              onChange={(v) => set("comfortableMeasuring", v)}
            />
            {errors.comfortableMeasuring && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.comfortableMeasuring}</p>}

            <RadioGroup
              label="Comfortable using a smartphone app *"
              options={["Yes", "Yes with guidance", "No"]}
              value={form.comfortableWithApp}
              onChange={(v) => set("comfortableWithApp", v)}
            />
            {errors.comfortableWithApp && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.comfortableWithApp}</p>}

            <RadioGroup
              label="Own transport *"
              options={["Yes", "No"]}
              value={form.ownTransport}
              onChange={(v) => set("ownTransport", v)}
            />
            {errors.ownTransport && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.ownTransport}</p>}

            <CheckboxGroup
              label="Days available *"
              options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
              value={form.daysAvailable}
              onChange={(v) => set("daysAvailable", v)}
            />
            {errors.daysAvailable && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.daysAvailable}</p>}

            <CheckboxGroup
              label="Hours available *"
              options={["Mornings", "Afternoons", "Evenings", "Flexible"]}
              value={form.hoursAvailable}
              onChange={(v) => set("hoursAvailable", v)}
            />
            {errors.hoursAvailable && <p style={{ color: "#e07070", fontSize: 13, marginTop: -14, marginBottom: 14 }}>{errors.hoursAvailable}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={back} style={{ flex: 1, padding: "16px", background: "transparent", color: TEXT_MUTED, borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 16, fontFamily: "system-ui", cursor: "pointer" }}>Back</button>
              <button onClick={next} style={{ flex: 2, padding: "16px", background: GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, fontFamily: "system-ui", cursor: "pointer" }}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, color: TEXT, marginBottom: 8 }}>How we work together</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>Short and honest.</p>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px", marginBottom: 28 }}>
              {[
                "As a Strata surveyor you're the first person our customers meet in person. That moment matters.",
                "You'll arrive on time or let us know early if something changes.",
                "You'll measure carefully — we'll give you everything you need to do this confidently.",
                "You'll present the samples the customer has shortlisted and answer questions honestly. If you don't know something, that's fine — just say so and we'll follow up.",
                "You'll take clear photos of each room and submit your report through the app before you leave or within an hour of finishing.",
                "You won't discuss pricing with the customer — that's handled by Strata.",
                "We'll pay you per completed survey within 48 hours of report submission, every time.",
                "We're not asking you to be a salesperson. We're asking you to be helpful, honest and thorough. That's it.",
              ].map((para, i) => (
                <p key={i} style={{ color: TEXT, fontSize: 15, lineHeight: 1.7, marginBottom: i < 7 ? 16 : 0, fontFamily: "system-ui" }}>{para}</p>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", marginBottom: 28, padding: "16px", background: form.agreed ? "rgba(201,169,110,0.08)" : SURFACE, border: `1px solid ${form.agreed ? GOLD : BORDER}`, borderRadius: 10, transition: "all 0.2s" }}>
              <div onClick={() => set("agreed", !form.agreed)} style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${form.agreed ? GOLD : BORDER}`, background: form.agreed ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transition: "all 0.2s" }}>
                {form.agreed && <span style={{ color: BG, fontSize: 14, fontWeight: 700 }}>✓</span>}
              </div>
              <input type="checkbox" checked={form.agreed} onChange={() => set("agreed", !form.agreed)} style={{ display: "none" }} />
              <span style={{ color: form.agreed ? TEXT : TEXT_MUTED, fontSize: 15, fontFamily: "system-ui" }}>I agree.</span>
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

        {/* Step 4 */}
        {step === 4 && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,169,110,0.15)", border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 28 }}>✓</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 400, color: TEXT, marginBottom: 16 }}>
              Thanks {form.fullName.split(" ")[0]}.
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
              We&apos;ll be in touch within 24 hours. Surveying with Strata is straightforward — we&apos;ll give you everything you need before your first visit.
            </p>
            {reference && (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 24px", display: "inline-block" }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 4 }}>Your reference</p>
                <p style={{ color: GOLD, fontSize: 22, fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0, letterSpacing: 1 }}>{reference}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
