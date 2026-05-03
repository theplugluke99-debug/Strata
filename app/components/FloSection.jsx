"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const GOLD = "#c9a96e";
const BG_DEEP = "#0e0e0c";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "rgba(242,237,224,0.45)";
const GREEN = "#6ec97a";
const SERIF = "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)";
const SANS = "var(--font-outfit,'Outfit',system-ui,sans-serif)";

const INITIAL_MESSAGE =
  "Hi — what are you trying to figure out? I can help with anything from choosing the right floor for a specific room to understanding what's involved in the fitting process.";

const SUGGESTION_CHIPS = [
  "Help me choose a floor",
  "How does the survey work?",
  "What's LVT?",
  "How long does fitting take?",
];

const stripMarkdown = (text) => {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[ \t]*[-*+]\s+/gm, "")
    .replace(/^[ \t]*\d+\.\s+/gm, "")
    .replace(/`{1,3}(.*?)`{1,3}/gs, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const Waveform = ({ active = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "20px" }}>
    {[0, 0.2, 0.4, 0.2, 0].map((delay, i) => (
      <div
        key={i}
        style={{
          width: "3px",
          height: "20px",
          background: GOLD,
          borderRadius: "2px",
          transformOrigin: "bottom",
          animation: `waveform ${active ? "0.6s" : "1.2s"} ease-in-out infinite`,
          animationDelay: `${delay}s`,
          opacity: active ? 1 : 0.5,
        }}
      />
    ))}
  </div>
);

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 180, 360].map((d) => (
        <span
          key={d}
          style={{
            width: 5, height: 5, borderRadius: "50%", background: GOLD,
            display: "inline-block", animation: `flo-dot 1.2s ${d}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}

function SendIcon({ color = "#111" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FloSection() {
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showChips, setShowChips]     = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  const messagesRef    = useRef(null);
  const inputRef       = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Allow nav "Ask our expert" button to open this panel on desktop
  useEffect(() => {
    const handler = () => { if (!isMobileView) setIsOpen(true); };
    window.addEventListener("open-flo", handler);
    return () => window.removeEventListener("open-flo", handler);
  }, [isMobileView]);

  // Load opening message when first expanded
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      setMessages([{ role: "assistant", content: INITIAL_MESSAGE }]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleCardClick = () => {
    if (isMobileView) {
      window.location.href = "/flo";
    } else {
      setIsOpen(true);
    }
  };

  const sendMessage = useCallback(
    async (textOverride) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      const history = messages.filter((m) => m.content !== "");
      setShowChips(false);
      setInput("");

      setMessages((prev) => [
        ...prev.filter((m) => m.content !== ""),
        { role: "user", content: text },
        { role: "assistant", content: "" },
      ]);
      setLoading(true);

      try {
        const res = await fetch("/api/flo/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, context: { role: "customer" }, history }),
        });
        const data = await res.json();
        const reply = stripMarkdown(data.response) || "Something went wrong. Give it another try.";
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: reply };
          return copy;
        });
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: "Something went wrong. Give it another try." };
          return copy;
        });
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goldBorder = {
    background: "linear-gradient(#1a1a18, #1a1a18) padding-box, linear-gradient(135deg, rgba(201,169,110,0.6), rgba(201,169,110,0.1), rgba(201,169,110,0.6)) border-box",
    border: "1px solid transparent",
  };

  return (
    <section style={{ background: BG_DEEP, padding: "0 20px" }}>
      <FloStyles />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 0" }}>

        {/* ── CLOSED STATE ─────────────────────────────────────────── */}
        {!isOpen && (
          <button
            onClick={handleCardClick}
            style={{
              width: "100%",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 20,
              ...goldBorder,
              borderRadius: 4,
              padding: "20px 24px",
              cursor: "pointer",
              color: TEXT,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: "50%", background: GOLD,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, boxShadow: "0 0 20px rgba(201,169,110,0.3)",
                  animation: "flo-pulse 2s ease-in-out infinite",
                }}
              >
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "#111" }}>F</span>
              </div>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: TEXT, lineHeight: 1.2, marginBottom: 3 }}>
                  Ask our expert
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: TEXT_MUTED }}>
                  Flooring advice — no obligation
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              <Waveform active={false} />
              <span style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>→</span>
            </div>
          </button>
        )}

        {/* ── EXPANDED STATE ───────────────────────────────────────── */}
        {isOpen && (
          <div
            style={{
              ...goldBorder,
              borderRadius: 4,
              height: 480,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px",
                borderBottom: "1px solid rgba(201,169,110,0.1)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%", background: GOLD,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, fontWeight: 700, color: "#111" }}>F</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.2 }}>
                  Flo — Flooring Expert
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                  <span style={{ fontFamily: SANS, fontSize: 10, color: GOLD }}>Online now</span>
                </div>
              </div>
              {loading && <Waveform active={true} />}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(242,237,224,0.04)", border: "1px solid rgba(201,169,110,0.18)",
                  borderRadius: 4, padding: "5px 11px", color: "rgba(242,237,224,0.4)",
                  fontFamily: SANS, fontSize: 11, cursor: "pointer",
                }}
              >
                ↓ Minimise
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              style={{
                height: 320, overflowY: "auto", padding: "14px 16px",
                display: "flex", flexDirection: "column", gap: 10,
                scrollbarWidth: "none",
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "assistant" && (
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: "50%", background: GOLD,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginRight: 8, marginTop: 2, alignSelf: "flex-start",
                      }}
                    >
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 9, fontWeight: 700, color: "#111" }}>F</span>
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "85%",
                      background: msg.role === "user" ? "rgba(201,169,110,0.15)" : SURFACE,
                      border: `1px solid ${msg.role === "user" ? "rgba(201,169,110,0.3)" : BORDER}`,
                      borderRadius: 4, padding: "12px 14px",
                      fontSize: 13, lineHeight: 1.7, color: TEXT,
                      fontFamily: SANS, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    }}
                  >
                    {msg.role === "assistant" && msg.content === "" ? <TypingDots /> : msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestion chips */}
            {showChips && messages.length === 1 && (
              <div
                style={{
                  padding: "8px 16px 6px", display: "flex", gap: 6, flexWrap: "wrap",
                  borderTop: "1px solid rgba(201,169,110,0.07)", flexShrink: 0,
                }}
              >
                {SUGGESTION_CHIPS.map((chip) => (
                  <button key={chip} onClick={() => sendMessage(chip)} disabled={loading} className="flo-chip-suggest">
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div
              style={{
                padding: "10px 16px", borderTop: "1px solid rgba(201,169,110,0.1)",
                background: BG_DEEP, flexShrink: 0, marginTop: "auto",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                  placeholder="Ask Flo anything…"
                  className="flo-input-bare"
                  style={{ opacity: loading ? 0.55 : 1 }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flo-send-btn"
                  style={{ background: !input.trim() || loading ? "rgba(201,169,110,0.18)" : GOLD }}
                >
                  <SendIcon color={!input.trim() || loading ? "rgba(201,169,110,0.4)" : "#111"} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

function FloStyles() {
  return (
    <style>{`
      @keyframes waveform { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
      @keyframes flo-dot { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
      @keyframes flo-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

      .flo-chip-suggest {
        background: transparent;
        border: 1px solid rgba(201,169,110,0.18);
        border-radius: 14px; padding: 4px 10px;
        color: rgba(242,237,224,0.48);
        font-family: var(--font-outfit,'Outfit',system-ui,sans-serif);
        font-size: 11px; cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
      }
      .flo-chip-suggest:hover:not(:disabled) { border-color: #c9a96e; color: #f2ede0; }
      .flo-chip-suggest:disabled { opacity: 0.4; cursor: default; }

      .flo-input-bare {
        flex: 1;
        background: rgba(242,237,224,0.05);
        border: 1px solid rgba(201,169,110,0.2);
        border-radius: 6px; padding: 9px 13px;
        color: #f2ede0;
        font-family: var(--font-outfit,'Outfit',system-ui,sans-serif);
        font-size: 13px; outline: none;
        transition: border-color 0.15s;
      }
      .flo-input-bare:focus { border-color: rgba(201,169,110,0.5); }
      .flo-input-bare::placeholder { color: rgba(242,237,224,0.28); }

      .flo-send-btn {
        width: 36px; height: 36px;
        border: none; border-radius: 6px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background 0.15s;
      }
      .flo-send-btn:disabled { cursor: default; }
    `}</style>
  );
}
