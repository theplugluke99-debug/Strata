"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const GOLD = "#c9a96e";
const BG_DEEP = "#0e0e0c";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const GREEN = "#6ec97a";

const CLOSED_CHIPS = [
  "Help me choose a floor",
  "I have a problem with my floor",
  "Does my floor work with underfloor heating?",
];

const CATEGORIES = [
  { icon: "🏠", title: "New floors for my home", desc: "Find the right flooring for any room" },
  { icon: "🔧", title: "Installation questions", desc: "What to expect on fitting day" },
  { icon: "📋", title: "Materials explained", desc: "LVT, carpet, wood — demystified" },
  { icon: "✨", title: "Care and maintenance", desc: "Keep your floors looking their best" },
  { icon: "💬", title: "Start my quote", desc: "Get a sense of costs for your project" },
];

const SUGGESTIONS = [
  ["What's best for a busy home?", "Can I use underfloor heating?", "How long does fitting take?"],
  ["Tell me more about that", "What does fitting day involve?", "How do I get a quote?"],
  ["What about carpet?", "Is LVT worth it?", "What's the difference between LVT and laminate?"],
];

const INITIAL_MESSAGE =
  "Hi — I'm Flo. Tell me about your space and I'll help you figure out exactly what you need. No pressure, no sales pitch.";

export default function FloSection() {
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showCategories, setShowCats] = useState(true);
  const [suggIdx, setSuggIdx]         = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechOk, setSpeechOk]       = useState(false);

  const inputRef         = useRef(null);
  const messagesEndRef   = useRef(null);
  const recognitionRef   = useRef(null);
  const autoSendRef      = useRef(null);
  const latestTextRef    = useRef("");
  const sendRef          = useRef(null);
  const initialSetRef    = useRef(false);

  useEffect(() => {
    setSpeechOk(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (isOpen && !initialSetRef.current) {
      initialSetRef.current = true;
      setMessages([{ role: "assistant", content: INITIAL_MESSAGE }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !showCategories && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, showCategories]);

  const sendMessage = useCallback(
    async (textOverride) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      const history = messages.filter((m) => m.content !== "");

      if (!isOpen) setIsOpen(true);
      setShowCats(false);
      setInput("");
      latestTextRef.current = "";

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
          body: JSON.stringify({
            messages: [...history, { role: "user", content: text }],
            context: "customer",
            userContext: {},
          }),
        });
        const data = await res.json();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: data.response || "Something went wrong. Give it another try.",
          };
          return copy;
        });
        setSuggIdx((i) => (i + 1) % SUGGESTIONS.length);
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Something went wrong. Give it another try.",
          };
          return copy;
        });
      } finally {
        setLoading(false);
      }
    },
    [input, loading, isOpen, messages]
  );

  sendRef.current = sendMessage;

  const toggleSpeech = useCallback(() => {
    if (!speechOk) return;
    if (isListening) {
      recognitionRef.current?.stop();
      clearTimeout(autoSendRef.current);
      setIsListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-GB";

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
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
    rec.onend  = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [speechOk, isListening]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChip = (text) => {
    if (!isOpen) setIsOpen(true);
    sendMessage(text);
  };

  const handleCategory = (title) => {
    setShowCats(false);
    sendMessage(title);
  };

  const suggestions = SUGGESTIONS[suggIdx];

  return (
    <section style={{ background: BG_DEEP, borderTop: `1px solid rgba(201,169,110,0.28)` }}>
      {/* ── Always-visible closed header ─────────────────────────── */}
      <div style={{ padding: "20px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "0 20px" }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "100%",
            maxWidth: 820,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "18px 22px",
            cursor: "pointer",
            color: TEXT,
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)", fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "#111" }}>F</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)", fontSize: 18, fontWeight: 600, color: TEXT, lineHeight: 1.2, marginBottom: 4 }}>
              Got a question about flooring? Ask Flo.
            </div>
            <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5 }}>
              Tap anywhere to expand.
            </div>
          </div>
          <div style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>→</div>
        </button>
      </div>
      </div>

      {/* ── Expandable drawer ────────────────────────────────────── */}
      <div style={{
        maxHeight: isOpen ? "620px" : "0",
        overflow: "hidden",
        transition: "max-height 0.48s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{
          display: "flex",
          height: 580,
          borderTop: `1px solid rgba(201,169,110,0.1)`,
        }}>

          {/* ── Left panel ──────────────────────────────────────── */}
          <div className="flo-left-panel">
            {/* Herringbone bg */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `repeating-linear-gradient(45deg,rgba(201,169,110,0.12) 0,rgba(201,169,110,0.12) 1.5px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,rgba(201,169,110,0.07) 0,rgba(201,169,110,0.07) 1.5px,transparent 0,transparent 50%)`,
              backgroundSize: "18px 18px",
              opacity: 0.5,
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", padding: "28px 24px" }}>
              {/* Logo */}
              <div style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)", fontSize: 12, letterSpacing: "0.22em", color: "rgba(201,169,110,0.45)", textTransform: "uppercase", marginBottom: 30 }}>
                STRATA
              </div>

              {/* Flo identity */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)", fontStyle: "italic", fontSize: 32, fontWeight: 600, color: GOLD, lineHeight: 1.1, marginBottom: 5 }}>
                  Hi, I'm Flo
                </div>
                <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 8.5, letterSpacing: "0.18em", color: "rgba(201,169,110,0.55)", textTransform: "uppercase", marginBottom: 10 }}>
                  Flooring Expert
                </div>
                <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, fontWeight: 300, color: "rgba(242,237,224,0.5)", lineHeight: 1.75 }}>
                  Ask me anything — choosing the right floor, fitting questions, problems, costs.
                </div>
              </div>

              {/* Dancing Script line */}
              <div style={{ fontFamily: "var(--font-dancing,'Dancing Script',cursive)", fontSize: 19, color: "rgba(201,169,110,0.65)", marginBottom: 20, lineHeight: 1.4 }}>
                Let me find your perfect floor.
              </div>

              {/* Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "7px 12px", background: "rgba(110,201,122,0.06)", border: "1px solid rgba(110,201,122,0.2)", borderRadius: 20, alignSelf: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 10, color: "rgba(242,237,224,0.55)", letterSpacing: "0.04em" }}>
                  Not a chatbot. A flooring expert.
                </span>
              </div>

              {/* Trust pillars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: "auto" }}>
                {[
                  { icon: "◈", label: "Real expertise", desc: "Deep knowledge of every flooring type" },
                  { icon: "◎", label: "Personal guidance", desc: "Advice for your specific situation" },
                  { icon: "◉", label: "Always here",      desc: "Available day and night" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: GOLD, fontSize: 11, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 11, fontWeight: 500, color: "rgba(242,237,224,0.65)", marginBottom: 1 }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 10, fontWeight: 300, color: "rgba(242,237,224,0.3)" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel ─────────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative" }}>

            {/* Status bar */}
            <div style={{ padding: "10px 20px", borderBottom: `1px solid rgba(201,169,110,0.08)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                <span style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 11, color: "rgba(242,237,224,0.45)", letterSpacing: "0.05em" }}>
                  Flo is here
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="flo-collapse-btn" aria-label="Close">
                ↑ Close
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", scrollbarWidth: "none" }}>
              {showCategories ? (
                <>
                  <div style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)", fontSize: 22, fontWeight: 600, color: TEXT, marginBottom: 14 }}>
                    How can I help you today?
                  </div>

                  {/* Initial Flo message */}
                  {messages[0] && (
                    <div style={{ display: "flex", marginBottom: 16 }}>
                      <div style={{ maxWidth: "88%", padding: "11px 15px", borderRadius: "12px 12px 12px 3px", background: SURFACE, border: `1px solid ${BORDER}`, fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 13, lineHeight: 1.65, color: TEXT }}>
                        {messages[0].content}
                      </div>
                    </div>
                  )}

                  {/* Category cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {CATEGORIES.map(({ icon, title, desc }) => (
                      <button key={title} onClick={() => handleCategory(title)} className="flo-cat-card">
                        <div style={{ fontSize: 20, marginBottom: 7 }}>{icon}</div>
                        <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 12, fontWeight: 500, color: TEXT, marginBottom: 3, lineHeight: 1.3 }}>{title}</div>
                        <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 10, fontWeight: 300, color: "rgba(242,237,224,0.38)", lineHeight: 1.4 }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                      <div style={{
                        maxWidth: "82%",
                        padding: "10px 14px",
                        borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                        background: msg.role === "user" ? "rgba(201,169,110,0.11)" : SURFACE,
                        border: `1px solid ${msg.role === "user" ? "rgba(201,169,110,0.22)" : BORDER}`,
                        fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)",
                        fontSize: 13, lineHeight: 1.65, color: TEXT,
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                      }}>
                        {msg.role === "assistant" && msg.content === "" ? <TypingDots /> : msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Suggestion chips */}
            {!showCategories && (
              <div style={{ padding: "8px 20px 6px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: `1px solid rgba(201,169,110,0.07)`, flexShrink: 0 }}>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => handleChip(s)} disabled={loading} className="flo-chip-suggest">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div style={{ padding: "10px 16px 8px", borderTop: `1px solid rgba(201,169,110,0.1)`, background: BG_DEEP, flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {speechOk && (
                  <button onClick={toggleSpeech} className="flo-mic-btn" aria-label="Voice input"
                    style={{ color: isListening ? GOLD : "rgba(242,237,224,0.28)" }}
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
                  placeholder={isListening ? "Listening…" : "Ask Flo anything…"}
                  className="flo-input-bare"
                  style={{ opacity: loading ? 0.55 : 1 }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flo-send-btn"
                  style={{ background: !input.trim() || loading ? "rgba(201,169,110,0.18)" : GOLD, opacity: 1 }}
                  aria-label="Send"
                >
                  <SendIcon color={!input.trim() || loading ? "rgba(201,169,110,0.4)" : "#111"} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7, justifyContent: "center" }}>
                <LockIcon />
                <span style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: 9, color: "rgba(242,237,224,0.22)" }}>
                  Your information is safe with us.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloSectionStyles />
    </section>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 180, 360].map((d) => (
        <span key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, display: "inline-block", animation: `flo-dot 1.2s ${d}ms infinite` }} />
      ))}
    </span>
  );
}

function MicIcon({ listening }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: listening ? "flo-pulse 1s infinite" : "none", display: "block" }}>
      <rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 8c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon({ color = "#111" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 12" fill="none">
      <rect x="1" y="5" width="8" height="6.5" rx="1" stroke="rgba(242,237,224,0.22)" strokeWidth="0.9" />
      <path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke="rgba(242,237,224,0.22)" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function FloSectionStyles() {
  return (
    <style>{`
      .flo-left-panel {
        width: 260px; flex-shrink: 0;
        background: #0e0e0c;
        position: relative; overflow: hidden;
        border-right: 1px solid rgba(201,169,110,0.1);
      }
      @media (max-width: 639px) { .flo-left-panel { display: none !important; } }

      .flo-chip-closed {
        background: transparent;
        border: 1px solid rgba(201,169,110,0.28);
        border-radius: 20px; padding: 5px 13px;
        color: rgba(242,237,224,0.65);
        font-family: var(--font-outfit,'Outfit',system-ui,sans-serif);
        font-size: 11.5px; font-weight: 400;
        cursor: pointer; white-space: nowrap;
        transition: border-color 0.15s, color 0.15s;
      }
      .flo-chip-closed:hover { border-color: #c9a96e; color: #f2ede0; }

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

      .flo-cat-card {
        background: #1a1a18; border: 1px solid #2a2a28;
        border-radius: 8px; padding: 14px;
        cursor: pointer; text-align: left;
        transition: border-color 0.15s, background 0.15s;
      }
      .flo-cat-card:hover { border-color: rgba(201,169,110,0.38); background: #1f1f1d; }

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
        background: #c9a96e; border: none; border-radius: 6px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background 0.15s, opacity 0.15s;
      }
      .flo-send-btn:disabled { cursor: default; }

      .flo-mic-btn {
        background: none; border: none; cursor: pointer;
        padding: 6px; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: color 0.15s;
      }

      .flo-collapse-btn {
        background: rgba(242,237,224,0.04);
        border: 1px solid rgba(201,169,110,0.18);
        border-radius: 5px; padding: 5px 11px;
        color: rgba(242,237,224,0.4);
        font-family: var(--font-outfit,'Outfit',system-ui,sans-serif);
        font-size: 11px; cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
      }
      .flo-collapse-btn:hover { color: #f2ede0; border-color: rgba(201,169,110,0.4); }

      .flo-collapse-inline {
        background: none; border: none;
        color: rgba(201,169,110,0.55);
        font-family: var(--font-outfit,'Outfit',system-ui,sans-serif);
        font-size: 12px; cursor: pointer; padding: 0;
        transition: color 0.15s;
      }
      .flo-collapse-inline:hover { color: #c9a96e; }

      @keyframes flo-dot   { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
      @keyframes flo-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
    `}</style>
  );
}
