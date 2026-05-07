"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "rgba(242,237,224,0.45)";
const GREEN = "#6ec97a";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "system-ui, sans-serif";

const INITIAL_MESSAGE =
  "Hi — what are you trying to figure out? I can help with anything from choosing the right floor for a specific room to understanding what's involved in the fitting process.";

const SUGGESTION_CHIPS = [
  "Help me choose a floor",
  "What's the difference between LVT and laminate?",
  "How long does fitting take?",
  "What does a free survey involve?",
  "Get me a quick price estimate →",
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

export default function FloPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const messagesRef    = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-GB";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
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

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: BG,
        color: TEXT,
        overflow: "hidden",
        fontFamily: SANS,
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
        @keyframes waveform { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        @keyframes flo-dot { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
        @keyframes flo-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes flo-mic-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,0.5)} 50%{box-shadow:0 0 0 7px rgba(201,169,110,0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.2); border-radius: 2px; }
        .flo-page-input:focus { border-color: rgba(201,169,110,0.5) !important; outline: none; }
        .flo-page-input::placeholder { color: rgba(242,237,224,0.28); }
        .flo-page-chip {
          background: transparent;
          border: 1px solid rgba(201,169,110,0.28);
          border-radius: 20px;
          padding: 10px 16px;
          color: rgba(242,237,224,0.65);
          font-size: 13px;
          cursor: pointer;
          font-family: ${SANS};
          transition: border-color 0.15s, color 0.15s;
          min-height: 44px;
        }
        .flo-page-chip:hover { border-color: ${GOLD}; color: ${TEXT}; }
        .flo-mic-btn {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 1px solid ${GOLD};
          background: transparent; font-size: 18px; flex-shrink: 0;
          transition: background 0.15s;
        }
        .flo-mic-btn.listening {
          background: ${GOLD};
          animation: flo-mic-pulse 1s ease-in-out infinite;
        }
      `}</style>

      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: `1px solid ${BORDER}`,
          background: BG,
          flexShrink: 0,
        }}
      >
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 700, letterSpacing: "0.12em", color: TEXT, lineHeight: 1.1 }}>
            STRATA
          </div>
          <div style={{ fontSize: "8.5px", fontWeight: 300, letterSpacing: "0.2em", color: "rgba(242,237,224,0.3)", textTransform: "uppercase", marginTop: "1px" }}>
            Superior Flooring
          </div>
        </a>
        <a
          href="/"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "44px", height: "44px",
            background: "rgba(242,237,224,0.05)",
            border: `1px solid ${BORDER}`,
            borderRadius: "50%",
            color: "rgba(242,237,224,0.5)",
            textDecoration: "none",
            fontSize: "20px",
            lineHeight: 1,
          }}
        >
          ×
        </a>
      </div>

      {/* FLO IDENTITY — compact row */}
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "12px",
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: "50%", background: GOLD,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(201,169,110,0.3)",
            animation: "flo-pulse 2s ease-in-out infinite",
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 700, color: "#111" }}>F</span>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: SERIF, fontSize: "22px", fontWeight: 600, color: GOLD, lineHeight: 1 }}>Flo</span>
            <span style={{ fontSize: "11px", color: TEXT_MUTED }}>· Flooring Expert</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
            <span style={{ fontSize: "10px", color: GOLD }}>Online now</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Waveform active={loading} />
        </div>
      </div>

      {/* MESSAGES — flex-grow fills space, paddingBottom clears fixed input bar */}
      <div
        ref={messagesRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          paddingBottom: "136px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.map((msg, i) => {
          const flooringMentioned = msg.role === "assistant" && msg.content
            ? ["Carpet", "LVT", "Laminate", "Vinyl", "Herringbone"].find(f => msg.content.includes(f))
            : null;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignSelf: "stretch" }}>
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
                    borderRadius: 4,
                    padding: "12px 14px",
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: TEXT,
                    fontFamily: SANS,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.role === "assistant" && msg.content === "" ? (
                    <TypingDots />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
              {flooringMentioned && (
                <a
                  href="/"
                  onClick={e => {
                    e.preventDefault();
                    sessionStorage.setItem("floRecommendation", flooringMentioned);
                    window.location.href = "/#quote";
                  }}
                  style={{
                    display: "inline-block",
                    marginTop: "8px",
                    marginLeft: "28px",
                    background: "rgba(201,169,110,0.1)",
                    border: "1px solid rgba(201,169,110,0.3)",
                    borderRadius: "3px",
                    color: GOLD,
                    fontFamily: SANS,
                    fontSize: "11px",
                    padding: "8px 14px",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  Get a quote for {flooringMentioned} →
                </a>
              )}
            </div>
          );
        })}

        {showChips && messages.length === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: 4, paddingLeft: 28 }}>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                className="flo-page-chip"
                onClick={() => {
                  if (chip === "Get me a quick price estimate →") {
                    window.location.href = "/#quote";
                    return;
                  }
                  sendMessage(chip);
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM FIXED AREA — CTA bar + input, never hidden by keyboard */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        {/* CTA bar */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            background: "rgba(201,169,110,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(242,237,224,0.35)", fontWeight: 300 }}>
            Ready to get a price?
          </div>
          <a
            href="/"
            onClick={e => { e.preventDefault(); window.location.href = "/#quote"; }}
            style={{
              background: GOLD,
              color: "#111110",
              fontFamily: SANS,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "8px 16px",
              borderRadius: "2px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Get my quote →
          </a>
        </div>
        {/* Input bar */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, background: BG }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Ask Flo anything…"
            className="flo-page-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            style={{
              flex: 1,
              background: "rgba(242,237,224,0.05)",
              border: "1px solid rgba(201,169,110,0.2)",
              borderRadius: "6px",
              padding: "10px 13px",
              color: TEXT,
              fontSize: "16px",
              fontFamily: SANS,
              opacity: loading ? 0.55 : 1,
            }}
          />
          <button
            className={`flo-mic-btn${isListening ? " listening" : ""}`}
            onClick={isListening ? stopListening : startListening}
            title={isListening ? "Stop listening" : "Speak to Flo"}
          >
            🎤
          </button>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44,
              background: !input.trim() || loading ? "rgba(201,169,110,0.18)" : GOLD,
              border: "none", borderRadius: "6px",
              cursor: !input.trim() || loading ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.15s",
            }}
          >
            <SendIcon color={!input.trim() || loading ? "rgba(201,169,110,0.4)" : "#111"} />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
