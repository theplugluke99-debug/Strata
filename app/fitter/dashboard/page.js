"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import FloChat from "@/app/components/FloChat";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "#a09880";

const FITTING_TIPS = {
  default: ["Measure twice, cut once.", "Check subfloor is clean and level before you start.", "Dry-lay the first few planks to check pattern alignment."],
  Carpet: ["Ensure gripper rods are secure around the entire perimeter.", "Use a knee kicker to stretch carpet — avoid ripples.", "Double-check door bar heights before trimming."],
  LVT: ["Subfloor must be perfectly flat — check with a 2m rule.", "Allow 10mm expansion gap around the perimeter.", "Stagger joints at least 30cm between rows."],
  Laminate: ["Acclimatise boards for 48 hours before installation.", "Underlay joins should not align with board joints.", "Use pull bar and tapping block — never hammer directly on boards."],
  Herringbone: ["Snap a centre line before laying any boards.", "Pattern direction can change the feel of the room — confirm with customer first.", "Extra adhesive on herringbone ends prevents lifting over time."],
};

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

function PhotoUpload({ label, minCount, onPhotos, onScan }) {
  const [photos, setPhotos] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    const newPhotos = [];
    for (const file of Array.from(files)) {
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => { newPhotos.push(e.target.result); resolve(); };
        reader.readAsDataURL(file);
      });
    }
    const all = [...photos, ...newPhotos];
    setPhotos(all);
    onPhotos(all);

    if (onScan && all.length >= minCount) {
      setScanning(true);
      try {
        const res = await fetch(onScan.route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: all }),
        });
        const data = await res.json();
        if (data.success) setScanResult(data.data);
      } catch { /* silent */ }
      setScanning(false);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ color: TEXT_MUTED, fontSize: 13, fontFamily: "system-ui" }}>{label}</span>
        <span style={{ color: photos.length >= minCount ? "#6ec97a" : GOLD, fontSize: 13, fontFamily: "system-ui" }}>{photos.length}/{minCount} min</span>
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{ border: `2px dashed ${BORDER}`, borderRadius: 10, padding: 16, cursor: "pointer", textAlign: "center", background: "rgba(201,169,110,0.02)" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
        {photos.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {photos.map((src, i) => <img key={i} src={src} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }} />)}
            <div style={{ width: 64, height: 64, borderRadius: 6, border: `1px dashed ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontSize: 20 }}>+</div>
          </div>
        ) : (
          <p style={{ color: TEXT_MUTED, fontSize: 14, margin: 0, fontFamily: "system-ui" }}>Tap or drag photos here</p>
        )}
      </div>
      {scanning && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: SURFACE, borderRadius: 8 }}>
          <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0, fontFamily: "system-ui" }}>Analysing your photos...</p>
        </div>
      )}
      {scanResult && (
        <GoldCard style={{ marginTop: 12 }}>
          <p style={{ color: GOLD, fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: "system-ui" }}>AI Note</p>
          <p style={{ color: TEXT, fontSize: 14, margin: 0, lineHeight: 1.6, fontFamily: "system-ui" }}>{scanResult.note || scanResult.summary}</p>
          {scanResult.flags?.length > 0 && (
            <ul style={{ marginTop: 8, paddingLeft: 16 }}>
              {scanResult.flags.map((f, i) => <li key={i} style={{ color: TEXT_MUTED, fontSize: 13, fontFamily: "system-ui" }}>{f}</li>)}
            </ul>
          )}
        </GoldCard>
      )}
    </div>
  );
}

function ScoreDisplay({ score, summary, positives, improvements, flaggedAreas }) {
  const color = score >= 8 ? "#6ec97a" : score >= 6 ? "#e0a050" : "#e07070";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}15` }}>
          <span style={{ color, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600 }}>{score}</span>
        </div>
        <div>
          <p style={{ color, fontSize: 14, fontWeight: 600, margin: "0 0 4px", fontFamily: "system-ui" }}>
            {score >= 8 ? "Excellent finish" : score >= 6 ? "Good work" : "Needs attention"}
          </p>
          <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0, fontFamily: "system-ui" }}>Quality score</p>
        </div>
      </div>
      {summary && <p style={{ color: TEXT, fontSize: 14, lineHeight: 1.6, marginBottom: 12, fontFamily: "system-ui" }}>{summary}</p>}
      {positives?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ color: "#6ec97a", fontSize: 12, fontWeight: 600, marginBottom: 6, fontFamily: "system-ui" }}>POSITIVES</p>
          {positives.map((p, i) => <p key={i} style={{ color: TEXT_MUTED, fontSize: 13, margin: "0 0 4px", fontFamily: "system-ui" }}>✓ {p}</p>)}
        </div>
      )}
      {improvements?.length > 0 && (
        <div>
          <p style={{ color: score >= 6 ? "#e0a050" : "#e07070", fontSize: 12, fontWeight: 600, marginBottom: 6, fontFamily: "system-ui" }}>TO IMPROVE</p>
          {improvements.map((p, i) => <p key={i} style={{ color: TEXT_MUTED, fontSize: 13, margin: "0 0 4px", fontFamily: "system-ui" }}>• {p}</p>)}
        </div>
      )}
    </div>
  );
}

export default function FitterDashboard() {
  const router = useRouter();
  const [fitter, setFitter] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [flagText, setFlagText] = useState("");
  const [flagging, setFlagging] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [score, setScore] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [overrideNote, setOverrideNote] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState("0:00");
  const [monthEarnings, setMonthEarnings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("strata_fitter_id");
    const name = localStorage.getItem("strata_fitter_name");
    const email = localStorage.getItem("strata_fitter_email");
    if (!id) { router.push("/fitter/login"); return; }
    setFitter({ id, name, email });
    loadJob(id);
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      setElapsed(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const loadJob = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fitter/jobs?fitterId=${id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const activeStatuses = ["Available", "Accepted", "Pre-Start", "In Progress", "Awaiting Sign Off", "Paid"];
        const active = data.data.find((r) => activeStatuses.includes(r.fields?.Status));
        setJob(active || null);
        const paid = data.data.filter((r) => r.fields?.Status === "Paid");
        const total = paid.reduce((s, r) => s + (parseFloat(r.fields?.Earnings) || 0), 0);
        setMonthEarnings(total.toFixed(2));
      }
    } catch { setError("Couldn't load your jobs right now."); }
    setLoading(false);
  };

  const updateJob = async (fields) => {
    if (!job) return;
    setActionLoading(true);
    try {
      await fetch("/api/fitter/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, ...fields }),
      });
      await loadJob(fitter.id);
    } catch { setError("Couldn't update job. Please try again."); }
    setActionLoading(false);
  };

  const handleAccept = () => updateJob({ status: "Accepted" });
  const handlePass = () => updateJob({ status: "Passed" });
  const handleReady = () => updateJob({ status: "Pre-Start" });

  const handleStartJob = async () => {
    setStartTime(Date.now());
    await updateJob({ status: "In Progress" });
  };

  const handleFlag = async () => {
    if (!flagText.trim()) return;
    setFlagging(true);
    await fetch("/api/fitter/flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: flagText, relatedJobId: job?.id }),
    }).catch(() => {});
    await updateJob({ status: "Flagged", note: flagText });
    setFlagging(false);
    setFlagText("");
  };

  const handleAfterUpload = async (photos) => {
    setAfterPhotos(photos);
    if (photos.length >= 4) {
      setScoring(true);
      try {
        const res = await fetch("/api/fitter/score-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: photos }),
        });
        const data = await res.json();
        if (data.success) setScore(data.data);
      } catch { /* silent */ }
      setScoring(false);
    }
  };

  const handleComplete = async () => {
    const fields = { status: "Awaiting Sign Off", photos: `${afterPhotos.length} after photos` };
    if (score) { fields.aiScore = score.score; fields.aiNotes = score.summary; }
    if (overrideNote) fields.note = overrideNote;
    await updateJob(fields);
  };

  const signOut = () => {
    localStorage.removeItem("strata_fitter_id");
    localStorage.removeItem("strata_fitter_name");
    localStorage.removeItem("strata_fitter_email");
    router.push("/fitter/login");
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

  const status = job?.fields?.Status || "none";
  const f = job?.fields || {};
  const firstName = fitter?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui" }}>
      <Nav name={fitter?.name} onSignOut={signOut} />
      <FloChat
        context="fitter"
        userName={fitter?.name}
        jobDetails={job?.fields}
      />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px 80px" }}>
        {error && (
          <GoldCard style={{ marginBottom: 20, borderColor: "rgba(224,112,112,0.3)", background: "rgba(224,112,112,0.05)" }}>
            <p style={{ color: "#e07070", fontSize: 14, margin: 0 }}>{error}</p>
          </GoldCard>
        )}

        {/* STATE 1 — No active job */}
        {(!job || status === "none" || status === "Passed") && (
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 400, color: GOLD, marginBottom: 16 }}>
              {greeting} {firstName}.
            </h1>
            <p style={{ color: TEXT_MUTED, fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
              Jobs in your area will appear here as soon as they&apos;re confirmed. We&apos;ll notify you by text the moment one lands.
            </p>
            <div style={{ height: 1, background: `linear-gradient(to right, ${GOLD}40, transparent)`, marginBottom: 32 }} />
            {monthEarnings && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ color: TEXT_MUTED, fontSize: 13 }}>This month</span>
                <span style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28 }}>£{monthEarnings}</span>
              </div>
            )}
          </div>
        )}

        {/* STATE 2 — Job available */}
        {status === "Available" && (
          <div>
            <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>New job available</p>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "24px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "0 0 4px" }}>Location</p>
                  <p style={{ color: TEXT, fontSize: 20, fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0 }}>{f["Postcode District"] || f["Postcode"] || "—"}</p>
                </div>
                <span style={{ background: "rgba(201,169,110,0.15)", color: GOLD, padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                  {f["Flooring Type"] || "Flooring"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div><p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Approximate size</p><p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Approximate M2"] || "—"} m²</p></div>
                <div><p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Duration</p><p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Estimated Duration"] || "—"}</p></div>
                <div><p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Preferred date</p><p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Preferred Date"] || "—"}</p></div>
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20, textAlign: "center" }}>
                <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "0 0 4px" }}>Your earnings</p>
                <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 44, margin: 0, fontWeight: 400 }}>£{f["Earnings"] || "—"}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={handleAccept} disabled={actionLoading} style={{ width: "100%", padding: "18px", background: GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
                Accept this job
              </button>
              <button onClick={handlePass} disabled={actionLoading} style={{ width: "100%", padding: "18px", background: "transparent", color: TEXT_MUTED, borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 17, cursor: "pointer" }}>
                Pass
              </button>
            </div>
          </div>
        )}

        {/* STATE 3 — Accepted, pre-start */}
        {status === "Accepted" && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, marginBottom: 6 }}>Job details</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>Everything you need for this job.</p>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Customer</p>
                <p style={{ color: TEXT, fontSize: 18, margin: 0 }}>{f["Customer First Name"] || "—"}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Address</p>
                <p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Address"] || "—"}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Flooring type</p>
                <p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Flooring Type"] || "—"}</p>
              </div>
              {f["Subfloor Type"] && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Subfloor</p>
                  <p style={{ color: TEXT, fontSize: 16, margin: 0 }}>{f["Subfloor Type"]}</p>
                </div>
              )}
              {f["Customer Notes"] && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Customer notes</p>
                  <p style={{ color: TEXT, fontSize: 15, margin: 0, lineHeight: 1.5 }}>{f["Customer Notes"]}</p>
                </div>
              )}
              {f["Room Breakdown"] && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Rooms</p>
                  <p style={{ color: TEXT, fontSize: 15, margin: 0, lineHeight: 1.5 }}>{f["Room Breakdown"]}</p>
                </div>
              )}
              {f["AI Flags"] && (
                <GoldCard style={{ marginTop: 12 }}>
                  <p style={{ color: GOLD, fontSize: 12, fontWeight: 600, margin: "0 0 6px" }}>SURVEY NOTES</p>
                  <p style={{ color: TEXT, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{f["AI Flags"]}</p>
                </GoldCard>
              )}
            </div>

            {/* Fitting tips */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
              <button onClick={() => setTipsOpen(!tipsOpen)} style={{ width: "100%", padding: "14px 20px", background: "transparent", border: "none", color: TEXT, fontSize: 15, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Fitting tips for {f["Flooring Type"] || "this job"}</span>
                <span style={{ color: GOLD, fontSize: 18 }}>{tipsOpen ? "−" : "+"}</span>
              </button>
              {tipsOpen && (
                <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${BORDER}` }}>
                  {(FITTING_TIPS[f["Flooring Type"]] || FITTING_TIPS.default).map((tip, i) => (
                    <p key={i} style={{ color: TEXT_MUTED, fontSize: 14, margin: "12px 0 0", lineHeight: 1.6 }}>• {tip}</p>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleReady} disabled={actionLoading} style={{ width: "100%", padding: "18px", background: GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
              Got it, I&apos;m ready for this job
            </button>
          </div>
        )}

        {/* STATE 4 — Pre-start, before photos */}
        {status === "Pre-Start" && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, marginBottom: 8 }}>Before you start — protect yourself.</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Take a clear photo of each room before you start. Floor, subfloor if you&apos;re lifting, any issues you can see. This protects you if anything comes up later.
            </p>
            <PhotoUpload
              label="Before photos"
              minCount={4}
              onPhotos={setBeforePhotos}
              onScan={{ route: "/api/fitter/scan-photos" }}
            />
            {beforePhotos.length >= 4 && (
              <button onClick={handleStartJob} disabled={actionLoading} style={{ width: "100%", padding: "18px", background: GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
                Start the job
              </button>
            )}
            {beforePhotos.length < 4 && (
              <p style={{ color: TEXT_MUTED, fontSize: 13, textAlign: "center" }}>Upload at least 4 photos to continue</p>
            )}
          </div>
        )}

        {/* STATE 5 — In progress */}
        {status === "In Progress" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, margin: 0 }}>Job in progress</h2>
              {startTime && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: TEXT_MUTED, fontSize: 11, margin: "0 0 2px" }}>TIME</p>
                  <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, margin: 0 }}>{elapsed}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 12 }}>Something unexpected? Let us know and we&apos;ll be on it.</p>
              {!flagging ? (
                <button onClick={() => setFlagging(true)} style={{ width: "100%", padding: "14px", background: "transparent", color: "#e0a050", borderRadius: 10, border: "1px solid rgba(224,160,80,0.3)", fontSize: 15, cursor: "pointer" }}>
                  I need to flag something
                </button>
              ) : (
                <div>
                  <textarea
                    value={flagText} onChange={(e) => setFlagText(e.target.value)}
                    placeholder="What's going on? Be specific — we'll contact you asap."
                    rows={3}
                    style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 14, fontFamily: "system-ui", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setFlagging(false)} style={{ flex: 1, padding: "12px", background: "transparent", color: TEXT_MUTED, borderRadius: 8, border: `1px solid ${BORDER}`, cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleFlag} disabled={!flagText.trim()} style={{ flex: 2, padding: "12px", background: "#e0a050", color: BG, borderRadius: 8, border: "none", fontSize: 15, fontWeight: 600, cursor: flagText.trim() ? "pointer" : "not-allowed" }}>Send flag</button>
                  </div>
                  <GoldCard style={{ marginTop: 12 }}>
                    <p style={{ color: TEXT, fontSize: 13, margin: 0, lineHeight: 1.6 }}>We&apos;ve been notified. Someone will be in touch within the hour.</p>
                  </GoldCard>
                </div>
              )}
            </div>

            <div style={{ height: 1, background: BORDER, marginBottom: 28 }} />
            <button onClick={() => updateJob({ status: "Post-Job" })} disabled={actionLoading} style={{ width: "100%", padding: "20px", background: GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
              Job complete — upload final photos
            </button>
          </div>
        )}

        {/* STATE 6 — After photos + AI scoring */}
        {(status === "Post-Job") && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, marginBottom: 8 }}>Nearly there.</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Upload your after photos — this is the last step before payment.
            </p>
            <PhotoUpload
              label="After photos"
              minCount={4}
              onPhotos={handleAfterUpload}
              onScan={null}
            />

            {scoring && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 36, height: 36, border: `2px solid ${BORDER}`, borderTop: `2px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Scoring your installation...</p>
              </div>
            )}

            {score && (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <ScoreDisplay {...score} />
                {score.score < 6 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ color: "#e07070", fontSize: 14, marginBottom: 8 }}>
                      Before you mark this complete, take another look at {score.flaggedAreas?.[0] || "the flagged areas"}.
                    </p>
                    <textarea
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      placeholder="Add a note if you disagree with anything we've flagged..."
                      rows={3}
                      style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, fontFamily: "system-ui", resize: "none", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                )}
                {score.score >= 6 && score.score < 8 && (
                  <textarea
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Optional: add a note about anything flagged..."
                    rows={2}
                    style={{ width: "100%", marginTop: 16, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, fontFamily: "system-ui", resize: "none", outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            )}

            {afterPhotos.length >= 4 && (
              <button onClick={handleComplete} disabled={actionLoading || scoring} style={{ width: "100%", padding: "18px", background: GOLD, color: BG, borderRadius: 12, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
                Job done. Submitting for customer sign off.
              </button>
            )}
          </div>
        )}

        {/* STATE 7 — Awaiting sign off */}
        {status === "Awaiting Sign Off" && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,169,110,0.1)", border: `2px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>⏳</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 400, color: TEXT, marginBottom: 12 }}>
              Nicely done {firstName}.
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              We&apos;ve notified the customer to sign off. This usually takes a few hours. We&apos;ll let you know the moment it&apos;s confirmed.
            </p>
            {monthEarnings && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 4 }}>Month to date</p>
                <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32 }}>£{monthEarnings}</p>
              </div>
            )}
            {score && (
              <div style={{ display: "inline-block", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 24px" }}>
                <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Job quality score</p>
                <p style={{ color: score.score >= 8 ? "#6ec97a" : score.score >= 6 ? "#e0a050" : "#e07070", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, margin: 0 }}>{score.score}/10</p>
              </div>
            )}
          </div>
        )}

        {/* STATE 8 — Paid */}
        {status === "Paid" && (
          <div style={{ background: "rgba(201,169,110,0.08)", minHeight: "calc(100vh - 60px)", margin: "-24px -20px", padding: "40px 20px", textAlign: "center" }}>
            <div style={{ maxWidth: 400, margin: "0 auto" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 32 }}>✓</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 40, fontWeight: 400, color: TEXT, marginBottom: 10 }}>
                {firstName}, you&apos;ve been paid
              </h1>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 52, color: GOLD, marginBottom: 8 }}>£{f["Earnings"] || "—"}</p>
              <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 36 }}>It&apos;s on its way to your account now.</p>
              <div style={{ height: 1, background: `${GOLD}30`, marginBottom: 28 }} />
              {monthEarnings && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: TEXT_MUTED, fontSize: 13, margin: "0 0 4px" }}>Month to date</p>
                  <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, margin: 0 }}>£{monthEarnings}</p>
                </div>
              )}
              {score?.score >= 8 && (
                <GoldCard style={{ marginTop: 20, textAlign: "left" }}>
                  <p style={{ color: GOLD, fontSize: 14, margin: 0 }}>⭐ You&apos;re one of our top rated fitters. Keep it up.</p>
                </GoldCard>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
