"use client";
import { useState, useRef, useEffect } from "react";
import { useQuoteForm } from "../QuoteFormProvider";
import { SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER, btn } from "../tokens";
import BackButton from "../shared/BackButton";

const FLO_INTRO = "Hi, I'm Flo. Tell me about your project and I'll put together a proposal for you. What are you working on?";

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, marginTop: 2 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="2.5" stroke={GOLD} strokeWidth="1.2"/>
            <path d="M1.5 12.5C1.5 10 3.9 8.5 7 8.5C10.1 8.5 12.5 10 12.5 12.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <div style={{
        maxWidth: "78%",
        background: isUser ? GOLD_DIM : SURFACE,
        border: `1px solid ${isUser ? GOLD_BORDER : BORDER}`,
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        padding: "12px 16px",
        color: TEXT,
        fontFamily: "system-ui, sans-serif",
        fontSize: 14,
        lineHeight: 1.65,
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function PublicSectorChat({ onBackToLanes }) {
  const { state, dispatch } = useQuoteForm();
  const ps = state.publicSector;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contact, setContact] = useState(ps.contact);
  const [submitted, setSubmitted] = useState(ps.submitted);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Seed intro message once
  const [messages, setMessages] = useState(
    ps.conversation.length > 0
      ? ps.conversation
      : [{ role: "assistant", content: FLO_INTRO }]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const history = updated.slice(1); // skip intro
      const res = await fetch("/api/flo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: "customer",
          quoteContext: {
            laneType: "publicSector",
            instruction: "You are speaking with a public sector representative. Conduct a warm, professional conversation to understand their project — organisation type, project type and scale, location, timeline, and procurement route if known. After gathering enough information, present a structured summary and ask if they'd like to submit it to the team.",
          },
          history: history.filter(m => m.role === "user" || m.role === "assistant").map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.reply ?? "I had trouble connecting — please try again." };
      const final = [...updated, assistantMsg];
      setMessages(final);
      dispatch({ type: "PS_ADD_MESSAGE", payload: userMsg });
      dispatch({ type: "PS_ADD_MESSAGE", payload: assistantMsg });

      // Detect if Flo has reached summary stage
      if (data.reply && (data.reply.includes("submit") || data.reply.toLowerCase().includes("shall i send") || data.reply.toLowerCase().includes("shall we send"))) {
        setShowContactForm(true);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleSubmit = async () => {
    const ref = `STR-${Date.now().toString(36).toUpperCase()}`;
    dispatch({ type: "PS_UPDATE_CONTACT", payload: contact });
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_number: ref,
        customer_type: "publicSector",
        lane_flag: "urgent",
        conversation_transcript: messages.map(m => `${m.role === "user" ? "User" : "Flo"}: ${m.content}`).join("\n\n"),
        name: contact.name,
        organisation: contact.organisation,
        email: contact.email,
        phone: contact.phone,
        status: "New",
      }),
    });
    dispatch({ type: "PS_SET_SUBMITTED" });
    setSubmitted(true);
  };

  if (submitted) return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L9.5 16.5L19 7" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: 36, color: TEXT, margin: "0 0 12px" }}>Proposal submitted</h2>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, color: MUTED, maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
        Our team has been notified and will be in touch shortly. Thank you.
      </p>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
        <BackButton onClick={onBackToLanes} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="2.5" stroke={GOLD} strokeWidth="1.2"/>
              <path d="M1.5 14C1.5 11 4.2 9 8 9C11.8 9 14.5 11 14.5 14" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontSize: 14, fontWeight: 600 }}>Flo</div>
            <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11 }}>Strata's project advisor</div>
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", maxWidth: 680, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="2.5" stroke={GOLD} strokeWidth="1.2"/>
                <path d="M1.5 12.5C1.5 10 3.9 8.5 7 8.5C10.1 8.5 12.5 10 12.5 12.5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ display: "flex", gap: 5, padding: "12px 16px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px 16px 16px 4px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, opacity: 0.4, animation: `ps-pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />

        {/* Contact form appears when Flo is ready */}
        {showContactForm && !submitted && (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 24px", margin: "16px 0" }}>
            <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              Your details
            </div>
            {[
              { key: "name",         placeholder: "Your name" },
              { key: "organisation", placeholder: "Organisation name" },
              { key: "email",        placeholder: "Email address" },
              { key: "phone",        placeholder: "Phone number" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type={key === "email" ? "email" : "text"}
                placeholder={placeholder}
                value={contact[key] ?? ""}
                onChange={(e) => setContact(c => ({ ...c, [key]: e.target.value }))}
                style={{
                  background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8,
                  color: TEXT, fontFamily: "system-ui, sans-serif", fontSize: 14, padding: "12px 16px",
                  width: "100%", outline: "none", marginBottom: 10,
                }}
              />
            ))}
            <button
              onClick={handleSubmit}
              disabled={!contact.name || !contact.email}
              style={{ ...btn, width: "100%", padding: "14px", marginTop: 4, opacity: contact.name && contact.email ? 1 : 0.4 }}
            >
              Submit this to our team →
            </button>
          </div>
        )}
      </div>

      {/* Input bar */}
      {!showContactForm && (
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, background: SURFACE, display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 680, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Describe your project…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 12,
              color: TEXT, fontFamily: "system-ui, sans-serif", fontSize: 14, padding: "12px 16px",
              outline: "none", resize: "none", maxHeight: 120, overflowY: "auto", lineHeight: 1.5,
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: 12, border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
              background: input.trim() && !loading ? GOLD : BORDER,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9H15M10 4L15 9L10 14" stroke={input.trim() && !loading ? "#111110" : MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes ps-pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        textarea { -webkit-text-fill-color: ${TEXT}; }
      `}</style>
    </div>
  );
}
