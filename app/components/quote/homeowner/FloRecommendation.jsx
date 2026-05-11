"use client";
import { useEffect, useState } from "react";
import { useQuoteForm, computeEstimate } from "../QuoteFormProvider";
import { BG, SURFACE, SURFACE2, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, GOLD_BORDER, btn, btnGhost } from "../tokens";
import BackButton from "../shared/BackButton";

const TIER_STYLE = {
  Good:   { label: "Good",   color: "#8aaa88", bg: "rgba(138,170,136,0.1)" },
  Better: { label: "Better", color: GOLD,      bg: GOLD_DIM },
  Best:   { label: "Best",   color: "#a898d8", bg: "rgba(168,152,216,0.1)" },
};

function RoomCard({ rec }) {
  const tier = TIER_STYLE[rec.recommended_tier] ?? TIER_STYLE.Better;
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {rec.room}
          </div>
          <div style={{ background: tier.bg, border: `1px solid ${tier.color}30`, borderRadius: 20, padding: "4px 12px", color: tier.color, fontFamily: "system-ui, sans-serif", fontSize: 12, fontWeight: 600 }}>
            {tier.label}
          </div>
        </div>
        <p style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>
          {rec.reason}
        </p>
      </div>
      <div style={{ padding: "12px 24px 20px", borderTop: `1px solid ${BORDER}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {rec.good_note && (
          <div style={{ padding: "10px 14px", background: SURFACE2, borderRadius: 8 }}>
            <div style={{ color: TIER_STYLE.Good.color, fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Good</div>
            <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, lineHeight: 1.4 }}>{rec.good_note}</div>
          </div>
        )}
        {rec.best_note && (
          <div style={{ padding: "10px 14px", background: SURFACE2, borderRadius: 8 }}>
            <div style={{ color: TIER_STYLE.Best.color, fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Best</div>
            <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, lineHeight: 1.4 }}>{rec.best_note}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FloRecommendation({ onBack, onSubmit }) {
  const { state, dispatch } = useQuoteForm();
  const { rooms, floRecommendations } = state.homeowner;
  const [loading, setLoading] = useState(!floRecommendations);
  const [error, setError]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const estimate = computeEstimate(rooms);

  useEffect(() => {
    if (floRecommendations) return;
    const roomData = Object.entries(rooms).map(([name, r]) => ({
      room: name,
      flooringType: r.flooringType,
      mood: r.mood,
      practicalFlags: r.practicalFlags,
      area: r.dimensions?.area,
    }));
    fetch("/api/flo/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ laneType: "homeowner", roomData }),
    })
      .then((r) => r.json())
      .then((data) => {
        dispatch({ type: "HO_SET_FLO", payload: data.rooms ?? [] });
        setLoading(false);
      })
      .catch(() => {
        setError("Flo couldn't connect right now. You can still proceed.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: 120 }}>
      <div style={{ padding: "20px 24px 0" }}>
        <BackButton onClick={onBack} />
      </div>

      <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "28px 24px 24px" }}>
        {/* Flo header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3.5" stroke={GOLD} strokeWidth="1.3"/>
              <path d="M3 17C3 13.5 6 11 10 11C14 11 17 13.5 17 17" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ color: GOLD, fontFamily: "system-ui, sans-serif", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Flo</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: "clamp(22px,4vw,34px)", color: TEXT, margin: 0, lineHeight: 1.2 }}>
              Here's what I'd recommend
            </h2>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: GOLD, fontFamily: "system-ui, sans-serif", fontSize: 13, marginBottom: 12, letterSpacing: "0.08em" }}>
              Flo is reviewing your rooms…
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD, opacity: 0.4, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(255,100,100,0.08)", border: "1px solid rgba(255,100,100,0.2)", borderRadius: 10, padding: "16px 20px", marginBottom: 24, color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
            {error}
          </div>
        )}

        {floRecommendations && floRecommendations.map((rec, i) => (
          <RoomCard key={i} rec={rec} />
        ))}

        {floRecommendations && (
          <>
            <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 13, lineHeight: 1.7, margin: "8px 0 32px", fontStyle: "italic", textAlign: "center" }}>
              None of this is final — your surveyor brings physical samples to your home. You choose in your own light.
            </p>

            {/* Estimate */}
            {estimate && (
              <div style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: 14, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Estimated total</div>
                  <div style={{ color: TEXT, fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: 24 }}>
                    £{estimate.low.toLocaleString()}
                    <span style={{ color: MUTED, fontWeight: 400, fontSize: 16 }}> – £{estimate.high.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 11, textAlign: "right", lineHeight: 1.6 }}>
                  Confirmed at<br />home survey
                </div>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => onSubmit("book_surveyor")}
                disabled={submitting}
                style={{ ...btn, padding: "16px", fontSize: 16, width: "100%", opacity: submitting ? 0.6 : 1 }}
              >
                Book a surveyor →
              </button>
              <button
                onClick={() => onSubmit("sample_box")}
                disabled={submitting}
                style={{ ...btnGhost, padding: "15px", fontSize: 15, width: "100%" }}
              >
                Request sample box — £25 deposit
              </button>
            </div>

            <p style={{ color: MUTED, fontFamily: "system-ui, sans-serif", fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
              Already know exactly what you want?{" "}
              <span style={{ color: GOLD }}>We can source and fit almost anything — just get in touch.</span>
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
      `}</style>
    </div>
  );
}
