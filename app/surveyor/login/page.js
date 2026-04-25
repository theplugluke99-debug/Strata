"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "#a09880";

export default function SurveyorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [mode, setMode] = useState("enter");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [recordId, setRecordId] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const confirmRefs = useRef([]);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const handlePinInput = (i, val, arr, setArr, nextRefs) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...arr];
    next[i] = val.slice(-1);
    setArr(next);
    if (val && i < 5) nextRefs.current[i + 1]?.focus();
    if (val && i === 5) submitPin(next);
  };

  const handleKeyDown = (i, e, arr, setArr, currentRefs) => {
    if (e.key === "Backspace" && !arr[i] && i > 0) currentRefs.current[i - 1]?.focus();
  };

  const submitPin = async (digits) => {
    const code = digits.join("");
    if (code.length < 6) return;

    if (mode === "set") {
      setConfirmPin(["", "", "", "", "", ""]);
      setMode("confirm");
      setTimeout(() => confirmRefs.current[0]?.focus(), 100);
      return;
    }

    if (mode === "confirm") {
      const pinCode = pin.join("");
      if (code !== pinCode) {
        setError("PINs don't match. Try again.");
        setConfirmPin(["", "", "", "", "", ""]);
        triggerShake();
        setTimeout(() => confirmRefs.current[0]?.focus(), 100);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/surveyor/set-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, pin: pinCode, recordId }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("strata_surveyor_id", data.data.id);
          localStorage.setItem("strata_surveyor_name", data.data.name);
          localStorage.setItem("strata_surveyor_email", data.data.email);
          router.push("/surveyor/dashboard");
        } else {
          setError("Something went wrong. Please try again.");
          triggerShake();
        }
      } catch {
        setError("Something went wrong. Please try again.");
        triggerShake();
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/surveyor/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("strata_surveyor_id", data.data.id);
        localStorage.setItem("strata_surveyor_name", data.data.name);
        localStorage.setItem("strata_surveyor_email", data.data.email);
        router.push("/surveyor/dashboard");
      } else if (!data.success && data.data?.needsPin) {
        setRecordId(data.data.recordId);
        setMode("set");
        setPin(["", "", "", "", "", ""]);
        setError("");
        setTimeout(() => refs.current[0]?.focus(), 100);
      } else {
        setError("That PIN isn't right. Try again.");
        setPin(["", "", "", "", "", ""]);
        triggerShake();
        setTimeout(() => refs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setEmailSubmitted(true);
    setTimeout(() => refs.current[0]?.focus(), 100);
  };

  const activePin = mode === "confirm" ? confirmPin : pin;
  const setActivePin = mode === "confirm" ? setConfirmPin : setPin;
  const activeRefs = mode === "confirm" ? confirmRefs : refs;

  const headings = { enter: "Welcome back.", set: "Set your PIN.", confirm: "Confirm your PIN." };
  const subs = { enter: "Enter your 6-digit PIN to continue.", set: "Choose a 6-digit PIN for your surveyor account.", confirm: "Enter your PIN again to confirm." };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>

        <div style={{ marginBottom: 40 }}>
          <p style={{ color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>STRATA</p>
          <p style={{ color: TEXT_MUTED, fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>SURVEYOR PORTAL</p>
          <div style={{ width: 2, height: 32, background: `linear-gradient(to bottom, ${GOLD}, transparent)`, margin: "0 auto 20px" }} />
        </div>

        {!emailSubmitted ? (
          <form onSubmit={handleEmailSubmit}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 400, color: TEXT, marginBottom: 10 }}>Welcome back.</h1>
            <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 32 }}>Enter your email address to continue.</p>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" autoFocus
              style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px", color: TEXT, fontSize: 16, textAlign: "center", outline: "none", boxSizing: "border-box", marginBottom: 16 }}
              onFocus={(e) => (e.target.style.borderColor = GOLD)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
            <button type="submit" style={{ width: "100%", padding: "16px", background: GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Continue</button>
          </form>
        ) : (
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 400, color: TEXT, marginBottom: 10 }}>{headings[mode]}</h1>
            <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 32 }}>{subs[mode]}</p>

            {mode === "set" && (
              <div style={{ background: "rgba(201,169,110,0.08)", border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
                <p style={{ color: GOLD, fontSize: 13, margin: 0 }}>First time logging in — let&apos;s set your PIN.</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24, animation: shake ? "shake 0.5s ease" : "none" }}>
              <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`}</style>
              {activePin.map((d, i) => (
                <input
                  key={i} ref={(el) => (activeRefs.current[i] = el)}
                  type="tel" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => handlePinInput(i, e.target.value, activePin, setActivePin, activeRefs)}
                  onKeyDown={(e) => handleKeyDown(i, e, activePin, setActivePin, activeRefs)}
                  style={{ width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 600, background: d ? "rgba(201,169,110,0.12)" : SURFACE, border: `2px solid ${d ? GOLD : BORDER}`, borderRadius: 10, color: TEXT, outline: "none", transition: "all 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = d ? GOLD : BORDER)}
                />
              ))}
            </div>

            {error && <p style={{ color: "#e07070", fontSize: 14, marginBottom: 16 }}>{error}</p>}
            {loading && <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 16 }}>Checking...</p>}

            <button onClick={() => { setEmailSubmitted(false); setMode("enter"); setPin(["","","","","",""]); setError(""); }} style={{ background: "transparent", border: "none", color: TEXT_MUTED, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Not you?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
