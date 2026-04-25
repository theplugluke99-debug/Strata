"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hi — I'm Flo, Strata's flooring expert. Whether you're choosing a floor, prepping for a fitting, or diagnosing a problem, I'm here. What can I help with?",
};

export default function FloChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    const assistantPlaceholder = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/flo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content:
              "Something went wrong on my end. Try again in a moment — or call us directly if it's urgent.",
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, streaming]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleClose = () => {
    if (abortRef.current) abortRef.current.abort();
    setOpen(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with Flo"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "9999px",
          background: "#c9a96e",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.06)";
          e.currentTarget.style.boxShadow = "0 6px 32px rgba(0,0,0,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.45)";
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5L15 15M15 5L5 15"
              stroke="#111110"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#111110",
              letterSpacing: "0.02em",
            }}
          >
            Flo
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "5.5rem",
            right: "1.5rem",
            zIndex: 9998,
            width: "min(92vw, 24rem)",
            height: "min(80vh, 36rem)",
            background: "#18170f",
            border: "1px solid rgba(201,169,110,0.18)",
            borderRadius: "1rem",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
            overflow: "hidden",
            animation: "floSlideUp 0.2s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "0.875rem 1rem",
              borderBottom: "1px solid rgba(201,169,110,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                background: "#c9a96e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: "#111110",
                }}
              >
                Flo
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#f2ede0",
                  lineHeight: 1.2,
                }}
              >
                Flo
              </div>
              <div
                style={{
                  fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                  fontSize: "0.7rem",
                  color: "rgba(242,237,224,0.45)",
                  lineHeight: 1.2,
                }}
              >
                Strata's flooring expert
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close chat"
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem",
                color: "rgba(242,237,224,0.4)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              scrollbarWidth: "none",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "0.625rem 0.875rem",
                    borderRadius:
                      msg.role === "user"
                        ? "1rem 1rem 0.25rem 1rem"
                        : "1rem 1rem 1rem 0.25rem",
                    background:
                      msg.role === "user"
                        ? "rgba(201,169,110,0.15)"
                        : "rgba(242,237,224,0.05)",
                    borderLeft:
                      msg.role === "assistant"
                        ? "2px solid rgba(201,169,110,0.35)"
                        : "none",
                    fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                    fontSize: "0.8125rem",
                    lineHeight: 1.55,
                    color: "#f2ede0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content || (
                    <span
                      style={{
                        display: "inline-flex",
                        gap: "0.25rem",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ animation: "floDot 1.2s 0s infinite" }}>·</span>
                      <span style={{ animation: "floDot 1.2s 0.2s infinite" }}>·</span>
                      <span style={{ animation: "floDot 1.2s 0.4s infinite" }}>·</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid rgba(201,169,110,0.12)",
              display: "flex",
              gap: "0.5rem",
              flexShrink: 0,
              background: "#111110",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={streaming}
              placeholder="Ask Flo anything about flooring…"
              rows={1}
              style={{
                flex: 1,
                background: "rgba(242,237,224,0.06)",
                border: "1px solid rgba(201,169,110,0.2)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                color: "#f2ede0",
                fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
                fontSize: "0.8125rem",
                lineHeight: 1.5,
                resize: "none",
                outline: "none",
                transition: "border-color 0.15s",
                minHeight: "2.25rem",
                maxHeight: "6rem",
                overflowY: "auto",
                opacity: streaming ? 0.5 : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(201,169,110,0.55)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(201,169,110,0.2)";
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 96) + "px";
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || streaming}
              aria-label="Send"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "0.5rem",
                background:
                  !input.trim() || streaming
                    ? "rgba(201,169,110,0.2)"
                    : "#c9a96e",
                border: "none",
                cursor: !input.trim() || streaming ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke={!input.trim() || streaming ? "rgba(201,169,110,0.5)" : "#111110"}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floDot {
          0%, 60%, 100% { opacity: 0.2; }
          30% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
