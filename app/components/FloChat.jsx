"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const GOLD   = "#c9a96e";
const BG     = "#111110";
const DEEP   = "#0e0e0c";
const SURFACE = "#1a1a18";
const BORDER  = "#2a2a28";
const TEXT    = "#f2ede0";
const GREEN   = "#6ec97a";

const stripMarkdown = (text) => {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/gs, '$1')
    .replace(/\*(.*?)\*/gs, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[ \t]*[-*+]\s+/gm, '')
    .replace(/^[ \t]*\d+\.\s+/gm, '')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const OPENING = {
  customer: "Hi — I'm Flo. Tell me about your space and I'll help you figure out exactly what you need. No pressure, no sales pitch.",
  fitter:   (name) => `Morning${name ? " " + name : ""}. I've got your job details loaded up. Ask me anything — fitting techniques, subfloor questions, anything you need on site.`,
  surveyor: (name) => `Morning${name ? " " + name : ""}. I've briefed you on today's visit above. Let me know if you want more detail on anything before you go in.`,
};

const FITTER_CHIPS = (flooringType) => {
  const techChip = flooringType === "Carpet"    ? "Power stretcher technique"
                 : flooringType === "LVT"        ? "Expansion gap guidance"
                 : flooringType === "Herringbone" ? "Herringbone layout tips"
                 : flooringType === "Laminate"   ? "Acclimatisation checklist"
                 :                                 "Fitting technique guidance";
  return [techChip, "Flag an issue", "Earnings for this job"];
};

const SURVEYOR_CHIPS = ["Subfloor guidance", "Sample presentation tips", "Start report"];

export default function FloChat({ context = "customer", userName, jobDetails, visitDetails }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [isListening, setListening] = useState(false);
  const [speechOk, setSpeechOk] = useState(false);

  const inputRef        = useRef(null);
  const messagesEndRef  = useRef(null);
  const recognitionRef  = useRef(null);
  const autoSendRef     = useRef(null);
  const latestTextRef   = useRef("");
  const sendRef         = useRef(null);
  const initialSetRef   = useRef(false);

  const firstName = userName?.split(" ")[0];
  const flooringType = jobDetails?.["Flooring Type"] || "";
  const chips = context === "fitter" ? FITTER_CHIPS(flooringType) : SURVEYOR_CHIPS;

  useEffect(() => {
    setSpeechOk(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (isOpen && !initialSetRef.current) {
      initialSetRef.current = true;
      const content = context === "fitter" || context === "surveyor"
        ? OPENING[context](firstName)
        : OPENING.customer;
      setMessages([{ role: "assistant", content }]);
    }
  }, [isOpen, context, firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (textOverride) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      const history = messages.filter((m) => m.content !== "");
      setInput("");
      latestTextRef.current = "";

      setMessages((prev) => [
        ...prev.filter((m) => m.content !== ""),
        { role: "user", content: text },
        { role: "assistant", content: "" },
      ]);
      setLoading(true);

      try {
        const res = await fetch("/api/flo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, context, history }),
        });
        const data = await res.json();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: stripMarkdown(data.reply) || "Something went wrong. Try again.",
          };
          return copy;
        });
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: "Something went wrong. Try again." };
          return copy;
        });
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, context]
  );

  sendRef.current = sendMessage;

  const toggleSpeech = useCallback(() => {
    if (!speechOk) return;
    if (isListening) {
      recognitionRef.current?.stop();
      clearTimeout(autoSendRef.current);
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-GB";

    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      setInput(transcript);
      latestTextRef.current = transcript;
      clearTimeout(autoSendRef.current);
      if (e.results[e.results.length - 1]?.isFinal) {
        autoSendRef.current = setTimeout(() => {
          sendRef.current(latestTextRef.current);
          rec.stop();
        }, 1500);
      }
    };
    rec.onend   = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [speechOk, isListening]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const panelWidth = 340;

  return (
    <>
      {/* ── Toggle tab ────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close Flo" : "Open Flo"}
        style={{
          position: "fixed",
          right: isOpen ? panelWidth : 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1001,
          background: GOLD,
          border: "none",
          borderRadius: "8px 0 0 8px",
          padding: "14px 10px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          transition: "right 0.35s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-3px 0 18px rgba(0,0,0,0.4)",
        }}
      >
        <span style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)", fontStyle: "italic", fontSize: 15, fontWeight: 600, color: "#111", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>
          Flo
        </span>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
      </button>

      {/* ── Panel ─────────────────────────────────────────────── */}
      <div style={{
        position: "fixed",
        top: 0,
        right: isOpen ? 0 : -panelWidth,
        width: panelWidth,
        height: "100vh",
        background: DEEP,
        borderLeft: `1px solid rgba(201,169,110,0.15)`,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        transition: "right 0.35s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: isOpen ? "-8px 0 40px rgba(0,0,0,0.55)" : "none",
      }}>

        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid rgba(201,169,110,0.12)`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 6, background: "rgba(201,169,110,0.15)", border: `1px solid rgba(201,169,110,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: GOLD }}>F</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 13, fontWeight: 600, color: TEXT }}>Flo</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
            </div>
            <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 10, color: "rgba(242,237,224,0.4)", marginTop: 1 }}>
              {context === "fitter" ? "On site support" : context === "surveyor" ? "Survey support" : "Flooring expert"}
            </div>
          </div>
        </div>

        {/* Alert box */}
        {context === "fitter" && jobDetails && (
          <div style={{ margin: "12px 14px 0", padding: "12px 14px", background: "rgba(201,169,110,0.07)", border: `1px solid rgba(201,169,110,0.22)`, borderRadius: 8, flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 9, letterSpacing: "0.14em", color: GOLD, textTransform: "uppercase", marginBottom: 6 }}>Today's job</div>
            {jobDetails["Flooring Type"] && (
              <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT, marginBottom: 3 }}>
                <span style={{ color: "rgba(242,237,224,0.45)" }}>Floor: </span>{jobDetails["Flooring Type"]}
              </div>
            )}
            {jobDetails["Approximate M2"] && (
              <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT, marginBottom: 3 }}>
                <span style={{ color: "rgba(242,237,224,0.45)" }}>Size: </span>{jobDetails["Approximate M2"]} m²
              </div>
            )}
            {jobDetails["Subfloor"] && (
              <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT }}>
                <span style={{ color: "rgba(242,237,224,0.45)" }}>Subfloor: </span>{jobDetails["Subfloor"]}
              </div>
            )}
          </div>
        )}

        {context === "surveyor" && visitDetails && (
          <div style={{ margin: "12px 14px 0", padding: "12px 14px", background: "rgba(110,201,122,0.05)", border: `1px solid rgba(110,201,122,0.2)`, borderRadius: 8, flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 9, letterSpacing: "0.14em", color: GREEN, textTransform: "uppercase", marginBottom: 6 }}>Pre-visit brief</div>
            {visitDetails["Customer First Name"] && (
              <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT, marginBottom: 3 }}>
                <span style={{ color: "rgba(242,237,224,0.45)" }}>Customer: </span>{visitDetails["Customer First Name"]}
              </div>
            )}
            {visitDetails["Flooring Interest"] && (
              <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT, marginBottom: 3 }}>
                <span style={{ color: "rgba(242,237,224,0.45)" }}>Interested in: </span>{visitDetails["Flooring Interest"]}
              </div>
            )}
            {visitDetails["Budget"] && (
              <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT, marginBottom: 3 }}>
                <span style={{ color: "rgba(242,237,224,0.45)" }}>Budget: </span>{visitDetails["Budget"]}
              </div>
            )}
            {visitDetails["Samples To Bring"] && (
              <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT }}>
                <span style={{ color: "rgba(242,237,224,0.45)" }}>Samples: </span>{visitDetails["Samples To Bring"]}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", scrollbarWidth: "none" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{
                maxWidth: "86%",
                padding: "9px 13px",
                borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                background: msg.role === "user" ? "rgba(201,169,110,0.11)" : SURFACE,
                border: `1px solid ${msg.role === "user" ? "rgba(201,169,110,0.22)" : BORDER}`,
                fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)",
                fontSize: 12.5, lineHeight: 1.65, color: TEXT,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.role === "assistant" && msg.content === "" ? <TypingDots /> : msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick action chips */}
        <div style={{ padding: "6px 14px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: `1px solid rgba(201,169,110,0.07)`, flexShrink: 0 }}>
          {chips.map((c) => (
            <button key={c} onClick={() => sendMessage(c)} disabled={loading}
              style={{
                background: "transparent",
                border: `1px solid rgba(201,169,110,0.2)`,
                borderRadius: 14, padding: "4px 10px",
                color: "rgba(242,237,224,0.5)",
                fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)",
                fontSize: 10.5, cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
                opacity: loading ? 0.4 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = TEXT; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.2)"; e.currentTarget.style.color = "rgba(242,237,224,0.5)"; }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: "10px 12px", borderTop: `1px solid rgba(201,169,110,0.1)`, background: BG, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            {speechOk && (
              <button onClick={toggleSpeech} aria-label="Voice input"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 5, color: isListening ? GOLD : "rgba(242,237,224,0.28)", flexShrink: 0, transition: "color 0.15s" }}
              >
                <MicIcon listening={isListening} />
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder={isListening ? "Listening…" : "Ask Flo…"}
              style={{
                flex: 1,
                background: "rgba(242,237,224,0.05)",
                border: `1px solid rgba(201,169,110,0.2)`,
                borderRadius: 6, padding: "8px 12px",
                color: TEXT,
                fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)",
                fontSize: 12.5, outline: "none",
                opacity: loading ? 0.55 : 1,
                transition: "border-color 0.15s",
              }}
              onFocus={(e)  => { e.target.style.borderColor = "rgba(201,169,110,0.5)"; }}
              onBlur={(e)   => { e.target.style.borderColor = "rgba(201,169,110,0.2)"; }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send"
              style={{
                width: 32, height: 32,
                background: !input.trim() || loading ? "rgba(201,169,110,0.15)" : GOLD,
                border: "none", borderRadius: 6,
                cursor: !input.trim() || loading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background 0.15s",
              }}
            >
              <SendIcon color={!input.trim() || loading ? "rgba(201,169,110,0.35)" : "#111"} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flo-dot   { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
        @keyframes flo-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @media (max-width: 639px) {
          /* panel goes full-width on mobile */
          [data-flo-panel] { width: 100vw !important; }
        }
      `}</style>
    </>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 180, 360].map((d) => (
        <span key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, display: "inline-block", animation: `flo-dot 1.2s ${d}ms infinite` }} />
      ))}
    </span>
  );
}

function MicIcon({ listening }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ animation: listening ? "flo-pulse 1s infinite" : "none", display: "block" }}>
      <rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 8c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon({ color = "#111" }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
