"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FloChat from "@/app/components/FloChat";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "#a09880";

function Nav({ name, onSignOut }) {
  return (
    <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
      <p style={{ color: GOLD, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", margin: 0, fontFamily: "system-ui" }}>STRATA</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ color: TEXT_MUTED, fontSize: 13, fontFamily: "system-ui" }}>{name}</span>
        <button onClick={onSignOut} style={{ background: "transparent", border: "none", color: TEXT_MUTED, fontSize: 13, cursor: "pointer", textDecoration: "underline", fontFamily: "system-ui" }}>Sign out</button>
      </div>
    </div>
  );
}

function GoldCard({ children, style }) {
  return (
    <div style={{ background: "rgba(201,169,110,0.08)", border: `1px solid rgba(201,169,110,0.25)`, borderRadius: 12, padding: "16px 20px", ...style }}>
      {children}
    </div>
  );
}

function RoomEntry({ room, index, onChange, onAnalyse }) {
  const inputRef = useRef();
  const [analysing, setAnalysing] = useState(false);

  const handlePhoto = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      onChange(index, "photo", dataUrl);
      setAnalysing(true);
      try {
        const res = await fetch("/api/surveyor/analyse-photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomLabel: room.name, image: dataUrl }),
        });
        const data = await res.json();
        if (data.success) {
          const obs = data.data;
          if (obs.subfloorObservation && !room.subfloor) onChange(index, "subfloor", obs.subfloorObservation.includes("Concrete") ? "Concrete" : obs.subfloorObservation.includes("Timber") ? "Timber" : "");
          if (obs.issuesSpotted?.length) onChange(index, "issues", obs.issuesSpotted.join(", "));
          onChange(index, "aiNotes", obs.generalNotes || obs.existingFlooringObservation || "");
        }
      } catch { /* silent */ }
      setAnalysing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
      <p style={{ color: GOLD, fontSize: 15, fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: 16 }}>{room.name || `Room ${index + 1}`}</p>

      {/* Photo */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 8px" }}>Room photo</p>
        <div
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${BORDER}`, borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center", minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
        >
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && handlePhoto(e.target.files[0])} />
          {room.photo ? (
            <img src={room.photo} alt="" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0 }}>Tap to add photo</p>
          )}
        </div>
        {analysing && <p style={{ color: TEXT_MUTED, fontSize: 12, marginTop: 6 }}>Analysing photo...</p>}
        {room.aiNotes && (
          <GoldCard style={{ marginTop: 8, padding: "10px 14px" }}>
            <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>AI observation</p>
            <p style={{ color: TEXT, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{room.aiNotes}</p>
          </GoldCard>
        )}
      </div>

      {/* Dimensions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 6px" }}>Length (m)</p>
          <input value={room.length || ""} onChange={(e) => onChange(index, "length", e.target.value)} type="number" step="0.1" placeholder="0.0"
            style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 6px" }}>Width (m)</p>
          <input value={room.width || ""} onChange={(e) => onChange(index, "width", e.target.value)} type="number" step="0.1" placeholder="0.0"
            style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Subfloor */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 8px" }}>Subfloor type</p>
        <div style={{ display: "flex", gap: 8 }}>
          {["Concrete", "Timber"].map((opt) => (
            <button key={opt} onClick={() => onChange(index, "subfloor", opt)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${room.subfloor === opt ? GOLD : BORDER}`, background: room.subfloor === opt ? "rgba(201,169,110,0.12)" : "transparent", color: room.subfloor === opt ? GOLD : TEXT_MUTED, fontSize: 14, cursor: "pointer" }}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Existing flooring */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 6px" }}>Existing flooring</p>
        <input value={room.existingFloor || ""} onChange={(e) => onChange(index, "existingFloor", e.target.value)} placeholder="e.g. Old carpet, bare concrete..."
          style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Issues */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 6px" }}>Issues (optional)</p>
        <input value={room.issues || ""} onChange={(e) => onChange(index, "issues", e.target.value)} placeholder="Any concerns or issues..."
          style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Customer preference */}
      <div>
        <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 6px" }}>Customer&apos;s sample preference</p>
        <input value={room.preference || ""} onChange={(e) => onChange(index, "preference", e.target.value)} placeholder="What did they like?"
          style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      {room.length && room.width && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(201,169,110,0.06)", borderRadius: 8 }}>
          <p style={{ color: GOLD, fontSize: 13, margin: 0 }}>{(parseFloat(room.length) * parseFloat(room.width)).toFixed(2)} m²</p>
        </div>
      )}
    </div>
  );
}

export default function SurveyorDashboard() {
  const router = useRouter();
  const [surveyor, setSurveyor] = useState(null);
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [monthEarnings, setMonthEarnings] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [checklist, setChecklist] = useState([false, false, false, false, false]);

  const checkItems = [
    "Measure each room",
    "Confirm subfloor type",
    "Present samples",
    "Take photos of each room",
    "Submit report before leaving",
  ];

  useEffect(() => {
    const id = localStorage.getItem("strata_surveyor_id");
    const name = localStorage.getItem("strata_surveyor_name");
    const email = localStorage.getItem("strata_surveyor_email");
    if (!id) { router.push("/surveyor/login"); return; }
    setSurveyor({ id, name, email });
    loadVisit(id);
  }, []);

  const loadVisit = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/surveyor/visits?surveyorId=${id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const activeStatuses = ["Available", "Accepted", "In Progress", "Report Submitted", "Paid"];
        const active = data.data.find((r) => activeStatuses.includes(r.fields?.Status));
        setVisit(active || null);
        if (active?.fields?.["Room Names"]) {
          const names = active.fields["Room Names"].split(",").map((n) => n.trim());
          setRooms(names.map((n) => ({ name: n, photo: "", length: "", width: "", subfloor: "", existingFloor: "", issues: "", preference: "", aiNotes: "" })));
        }
        const paid = data.data.filter((r) => r.fields?.Status === "Paid");
        const total = paid.reduce((s, r) => s + (parseFloat(r.fields?.Pay) || 0), 0);
        setMonthEarnings(total.toFixed(2));
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const updateVisit = async (fields) => {
    if (!visit) return;
    setActionLoading(true);
    try {
      await fetch("/api/surveyor/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: visit.id, ...fields }),
      });
      await loadVisit(surveyor.id);
    } catch { /* silent */ }
    setActionLoading(false);
  };

  const updateRoom = (index, field, value) => {
    setRooms((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const addRoom = () => setRooms((r) => [...r, { name: `Room ${r.length + 1}`, photo: "", length: "", width: "", subfloor: "", existingFloor: "", issues: "", preference: "", aiNotes: "" }]);

  const totalM2 = rooms.reduce((sum, r) => {
    const l = parseFloat(r.length) || 0;
    const w = parseFloat(r.width) || 0;
    return sum + l * w;
  }, 0);

  const submitReport = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/surveyor/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: visit.id, status: "Report Submitted", report: { rooms, totalM2: totalM2.toFixed(2) } }),
      });
      setSubmitDone(true);
    } catch { /* silent */ }
    setSubmitting(false);
  };

  const signOut = () => {
    localStorage.removeItem("strata_surveyor_id");
    localStorage.removeItem("strata_surveyor_name");
    localStorage.removeItem("strata_surveyor_email");
    router.push("/surveyor/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `2px solid ${BORDER}`, borderTop: `2px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: TEXT_MUTED, fontFamily: "system-ui", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const status = visit?.fields?.Status || "none";
  const f = visit?.fields || {};
  const firstName = surveyor?.name?.split(" ")[0] || "there";

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui" }}>
      <Nav name={surveyor?.name} onSignOut={signOut} />
      <FloChat
        context="surveyor"
        userName={surveyor?.name}
        visitDetails={visit?.fields}
      />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* STATE 1 — No surveys */}
        {(!visit || status === "none") && (
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 400, color: GOLD, marginBottom: 16 }}>
              Welcome {firstName}.
            </h1>
            <p style={{ color: TEXT_MUTED, fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
              Survey requests in your area will appear here as they come in. We&apos;ll text you the moment one is available.
            </p>
            {monthEarnings && (
              <>
                <div style={{ height: 1, background: `linear-gradient(to right, ${GOLD}40, transparent)`, marginBottom: 24 }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ color: TEXT_MUTED, fontSize: 13 }}>This month</span>
                  <span style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28 }}>£{monthEarnings}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* STATE 2 — Survey available */}
        {status === "Available" && (
          <div>
            <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>Survey available</p>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div><p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Location</p><p style={{ color: TEXT, fontSize: 18, fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0 }}>{f["Postcode District"] || f["Postcode"] || "—"}</p></div>
                <div><p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Customer</p><p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Customer First Name"] || "—"}</p></div>
                <div><p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Interested in</p><p style={{ color: TEXT, fontSize: 15, margin: 0 }}>{f["Flooring Interest"] || "—"}</p></div>
                <div><p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Duration</p><p style={{ color: TEXT, fontSize: 15, margin: 0 }}>30–45 minutes</p></div>
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20, textAlign: "center", marginBottom: 20 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Pay for this survey</p>
                <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, margin: 0 }}>£{f["Pay"] || "—"}</p>
              </div>
              {f["Slot Options"] && (
                <div>
                  <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 10 }}>Select a time slot</p>
                  {f["Slot Options"].split(",").map((slot, i) => (
                    <button key={i} onClick={() => setSelectedSlot(slot.trim())} style={{ width: "100%", padding: "12px", marginBottom: 8, borderRadius: 8, border: `1px solid ${selectedSlot === slot.trim() ? GOLD : BORDER}`, background: selectedSlot === slot.trim() ? "rgba(201,169,110,0.1)" : "transparent", color: selectedSlot === slot.trim() ? GOLD : TEXT_MUTED, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
                      {slot.trim()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => updateVisit({ status: "Accepted" })} disabled={actionLoading} style={{ width: "100%", padding: "18px", background: GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>Accept</button>
              <button onClick={() => updateVisit({ status: "Passed" })} disabled={actionLoading} style={{ width: "100%", padding: "18px", background: "transparent", color: TEXT_MUTED, borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 17, cursor: "pointer" }}>Pass</button>
            </div>
          </div>
        )}

        {/* STATE 3 — Survey accepted */}
        {status === "Accepted" && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, marginBottom: 6 }}>Survey details</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>Everything you need before you arrive.</p>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Customer</p>
                <p style={{ color: TEXT, fontSize: 18, margin: 0 }}>{f["Customer Name"] || f["Customer First Name"] || "—"}</p>
              </div>
              <div style={{ marginBottom: 14 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Address</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Address"] || "—"}</p>
                  {f["Address"] && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(f["Address"])}`} target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontSize: 13, textDecoration: "none", padding: "6px 12px", border: `1px solid ${GOLD}40`, borderRadius: 6 }}>Maps ↗</a>
                  )}
                </div>
              </div>
              {f["Flooring Interest"] && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Interested in</p>
                  <p style={{ color: TEXT, fontSize: 15, margin: 0 }}>{f["Flooring Interest"]}</p>
                </div>
              )}
              {f["Dimensions"] && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Quote dimensions</p>
                  <p style={{ color: TEXT, fontSize: 15, margin: 0 }}>{f["Dimensions"]}</p>
                </div>
              )}
              {f["Samples To Bring"] && (
                <div>
                  <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Samples to bring</p>
                  <p style={{ color: TEXT, fontSize: 15, margin: 0 }}>{f["Samples To Bring"]}</p>
                </div>
              )}
            </div>

            <GoldCard style={{ marginBottom: 24 }}>
              <p style={{ color: GOLD, fontSize: 13, margin: 0 }}>You&apos;re not there to sell. You&apos;re there to help them make the right choice.</p>
            </GoldCard>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 14, fontWeight: 600 }}>CHECKLIST</p>
              {checkItems.map((item, i) => (
                <label key={i} onClick={() => setChecklist((c) => c.map((v, j) => j === i ? !v : v))} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checklist[i] ? GOLD : BORDER}`, background: checklist[i] ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    {checklist[i] && <span style={{ color: BG, fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ color: checklist[i] ? TEXT : TEXT_MUTED, fontSize: 14, transition: "color 0.2s" }}>{item}</span>
                </label>
              ))}
            </div>

            <button onClick={() => updateVisit({ status: "Day Of" })} disabled={actionLoading} style={{ width: "100%", padding: "18px", background: GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
              I&apos;m prepared for this survey
            </button>
          </div>
        )}

        {/* STATE 4 — Day of survey */}
        {status === "Day Of" && (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 400, color: TEXT, marginBottom: 12 }}>Ready to go.</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
              Tap when you arrive at the property.
            </p>
            <button onClick={() => updateVisit({ status: "In Progress" })} disabled={actionLoading} style={{ padding: "20px 48px", background: GOLD, color: BG, borderRadius: 14, border: "none", fontSize: 18, fontWeight: 600, cursor: "pointer" }}>
              I&apos;ve arrived
            </button>
            {f["Address"] && (
              <div style={{ marginTop: 20 }}>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(f["Address"])}`} target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontSize: 14, textDecoration: "none" }}>Open in Maps ↗</a>
              </div>
            )}
          </div>
        )}

        {/* STATE 5 — In progress (room by room) */}
        {status === "In Progress" && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, marginBottom: 6 }}>Room by room</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>Complete each room then submit your report.</p>

            {rooms.length === 0 && (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 20 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 14, margin: "0 0 12px" }}>No rooms set up yet. Add them below.</p>
              </div>
            )}

            {rooms.map((room, i) => (
              <RoomEntry key={i} room={room} index={i} onChange={updateRoom} />
            ))}

            <button onClick={addRoom} style={{ width: "100%", padding: "14px", background: "transparent", color: GOLD, borderRadius: 10, border: `1px dashed ${GOLD}50`, fontSize: 15, cursor: "pointer", marginBottom: 24 }}>
              + Add room
            </button>

            {totalM2 > 0 && (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: TEXT_MUTED, fontSize: 14 }}>Total area</span>
                <span style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24 }}>{totalM2.toFixed(2)} m²</span>
              </div>
            )}

            <button onClick={() => updateVisit({ status: "Report Ready" })} disabled={rooms.length === 0} style={{ width: "100%", padding: "18px", background: rooms.length > 0 ? GOLD : BORDER, color: rooms.length > 0 ? BG : TEXT_MUTED, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: rooms.length > 0 ? "pointer" : "not-allowed" }}>
              Review and submit report
            </button>
          </div>
        )}

        {/* STATE 6 — Report review and submission */}
        {(status === "Report Ready" || submitDone) && (
          <div>
            {!submitDone ? (
              <>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, marginBottom: 6 }}>Report summary</h2>
                <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>Review everything before submitting.</p>

                {rooms.map((room, i) => (
                  <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ color: TEXT, fontSize: 15, margin: 0 }}>{room.name}</p>
                      {room.length && room.width && (
                        <span style={{ color: GOLD, fontSize: 14 }}>{(parseFloat(room.length) * parseFloat(room.width)).toFixed(2)} m²</span>
                      )}
                    </div>
                    {room.subfloor && <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "4px 0 0" }}>Subfloor: {room.subfloor}</p>}
                    {room.existingFloor && <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "4px 0 0" }}>Existing: {room.existingFloor}</p>}
                    {room.issues && <p style={{ color: "#e07070", fontSize: 13, margin: "4px 0 0" }}>Issues: {room.issues}</p>}
                    {room.preference && <p style={{ color: GOLD, fontSize: 13, margin: "4px 0 0" }}>Preference: {room.preference}</p>}
                  </div>
                ))}

                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_MUTED, fontSize: 15 }}>Total area</span>
                  <span style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22 }}>{totalM2.toFixed(2)} m²</span>
                </div>

                <button onClick={submitReport} disabled={submitting} style={{ width: "100%", padding: "18px", background: submitting ? "rgba(201,169,110,0.5)" : GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Submitting..." : "Report submitted. Great work."}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>✓</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 400, color: TEXT, marginBottom: 12 }}>Report submitted.</h2>
                <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.7 }}>Great work {firstName}. Your report is in.</p>
              </div>
            )}
          </div>
        )}

        {/* STATE 7 — Paid */}
        {status === "Paid" && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>£</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 400, color: TEXT, marginBottom: 10 }}>
              {firstName}, your survey report has been received.
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>Your payment is on its way.</p>
            {monthEarnings && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "0 0 4px" }}>Month to date</p>
                <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, margin: 0 }}>£{monthEarnings}</p>
              </div>
            )}
            {f["Customer Rating"] && (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 24px", display: "inline-block" }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Customer rating</p>
                <p style={{ color: GOLD, fontSize: 22, fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0 }}>{f["Customer Rating"]}/5</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
