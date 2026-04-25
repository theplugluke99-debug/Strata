// OPERATOR_PASSWORD env var must be set in .env.local
// Default: OPERATOR_PASSWORD=strata2026
"use client";
import { useState, useEffect } from "react";

const GOLD = "#c9a96e";
const BG = "#111110";
const SURFACE = "#1a1a18";
const BORDER = "#2a2a28";
const TEXT = "#f2ede0";
const TEXT_MUTED = "#a09880";

function Badge({ label, color }) {
  const colors = {
    green: { bg: "rgba(110,201,122,0.12)", text: "#6ec97a" },
    amber: { bg: "rgba(224,160,80,0.12)", text: "#e0a050" },
    red: { bg: "rgba(224,112,112,0.12)", text: "#e07070" },
    gold: { bg: "rgba(201,169,110,0.12)", text: GOLD },
    blue: { bg: "rgba(110,160,224,0.12)", text: "#6ea0e0" },
  };
  const c = colors[color] || colors.gold;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "system-ui" }}>
      {label}
    </span>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, color: TEXT, margin: 0 }}>{title}</h2>
      {count !== undefined && (
        <span style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>{count}</span>
      )}
    </div>
  );
}

function ExpandableRow({ children, detail }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "14px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>{children}</div>
        <span style={{ color: TEXT_MUTED, fontSize: 16, marginLeft: 12 }}>{open ? "−" : "+"}</span>
      </div>
      {open && detail && (
        <div style={{ paddingBottom: 16, paddingLeft: 0 }}>{detail}</div>
      )}
    </div>
  );
}

function statusColor(s) {
  if (!s) return "gold";
  if (s === "Paid") return "green";
  if (s === "Awaiting Sign Off") return "amber";
  if (s === "In Progress" || s === "Pre-Start") return "blue";
  if (s === "Flagged") return "red";
  return "gold";
}

export default function OperatorDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");
  const [messageOpen, setMessageOpen] = useState(null);
  const [messageText, setMessageText] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "strata2026") {
      setAuthed(true);
      loadData();
    } else {
      setAuthError("Incorrect password.");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/operator/overview");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  const approveApplication = async (type, recordId) => {
    await fetch("/api/operator/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, recordId }),
    }).catch(() => {});
    await loadData();
  };

  const resolveFlag = async (flagId) => {
    await fetch("/api/operator/resolve-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagId }),
    }).catch(() => {});
    await loadData();
  };

  const sendMessage = (id) => {
    console.log("[Operator message to", id, "]:", messageText);
    setMessageOpen(null);
    setMessageText("");
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        <div style={{ width: "100%", maxWidth: 360, padding: 20, textAlign: "center" }}>
          <p style={{ color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>STRATA</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 400, color: TEXT, marginBottom: 8 }}>Operator dashboard</h1>
          <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>Enter your password to continue.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" autoFocus
              style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px", color: TEXT, fontSize: 16, textAlign: "center", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
              onFocus={(e) => (e.target.style.borderColor = GOLD)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
            {authError && <p style={{ color: "#e07070", fontSize: 13, marginBottom: 12 }}>{authError}</p>}
            <button type="submit" style={{ width: "100%", padding: "14px", background: GOLD, color: BG, borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Enter</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "jobs", label: "Jobs", count: data?.activeJobs?.length },
    { id: "applications", label: "Applications", count: (data?.pendingFitters?.length || 0) + (data?.pendingSurveyors?.length || 0) },
    { id: "leads", label: "Leads", count: data?.leads?.length },
    { id: "flags", label: "Flags", count: data?.flags?.length },
    { id: "revenue", label: "Revenue" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui" }}>
      {/* Header */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <p style={{ color: GOLD, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>STRATA OPERATOR</p>
        <button onClick={loadData} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: TEXT_MUTED, padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 20px", display: "flex", gap: 0, overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "14px 18px", background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? GOLD : "transparent"}`, color: activeTab === tab.id ? GOLD : TEXT_MUTED, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
            {tab.label}
            {tab.count !== undefined && <span style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: 11, padding: "1px 7px", borderRadius: 20 }}>{tab.count || 0}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 80px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: 36, height: 36, border: `2px solid ${BORDER}`, borderTop: `2px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Loading...</p>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === "jobs" && !loading && (
          <div>
            <SectionHeader title="Active Jobs" count={data?.activeJobs?.length} />
            {!data?.activeJobs?.length ? (
              <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No active jobs.</p>
            ) : (
              data.activeJobs.map((job) => {
                const f = job.fields || {};
                return (
                  <ExpandableRow key={job.id}
                    detail={
                      <div style={{ background: BG, borderRadius: 10, padding: 16 }}>
                        {Object.entries(f).filter(([k]) => !["Status"].includes(k)).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                            <span style={{ color: TEXT_MUTED, fontSize: 13, minWidth: 140 }}>{k}</span>
                            <span style={{ color: TEXT, fontSize: 13 }}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ color: TEXT_MUTED, fontSize: 12, fontFamily: "monospace" }}>{f["Reference Number"] || job.id.slice(-6)}</span>
                      <span style={{ color: TEXT, fontSize: 14 }}>{f["Postcode"] || f["Postcode District"] || "—"}</span>
                      <span style={{ color: TEXT_MUTED, fontSize: 14 }}>{f["Fitter Name"] || "—"}</span>
                      <span style={{ color: TEXT_MUTED, fontSize: 14 }}>{f["Flooring Type"] || "—"}</span>
                      <Badge label={f["Status"] || "Unknown"} color={statusColor(f["Status"])} />
                      {f["Earnings"] && <span style={{ color: GOLD, fontSize: 14, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>£{f["Earnings"]}</span>}
                      {f["AI Score"] && <span style={{ color: f["AI Score"] >= 8 ? "#6ec97a" : f["AI Score"] >= 6 ? "#e0a050" : "#e07070", fontSize: 13 }}>{f["AI Score"]}/10</span>}
                    </div>
                  </ExpandableRow>
                );
              })
            )}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && !loading && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <SectionHeader title="Pending Fitters" count={data?.pendingFitters?.length} />
              {!data?.pendingFitters?.length ? (
                <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No pending fitter applications.</p>
              ) : (
                data.pendingFitters.map((app) => {
                  const f = app.fields || {};
                  return (
                    <ExpandableRow key={app.id}
                      detail={
                        <div>
                          <div style={{ background: BG, borderRadius: 10, padding: 16, marginBottom: 12 }}>
                            {["Full Name", "Email", "Mobile", "Areas Covered", "Flooring Types", "Years Experience", "Has Own Van", "Has Public Liability Insurance"].map((k) => f[k] && (
                              <div key={k} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                                <span style={{ color: TEXT_MUTED, fontSize: 13, minWidth: 140 }}>{k}</span>
                                <span style={{ color: TEXT, fontSize: 13 }}>{f[k]}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => approveApplication("fitter", app.id)} style={{ flex: 1, padding: "10px", background: GOLD, color: BG, borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                            <button onClick={() => setMessageOpen(app.id)} style={{ flex: 1, padding: "10px", background: "transparent", color: TEXT_MUTED, borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, cursor: "pointer" }}>Message</button>
                          </div>
                          {messageOpen === app.id && (
                            <div style={{ marginTop: 12 }}>
                              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." rows={3}
                                style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                              <button onClick={() => sendMessage(app.id)} style={{ padding: "8px 20px", background: GOLD, color: BG, borderRadius: 6, border: "none", fontSize: 14, cursor: "pointer" }}>Send</button>
                            </div>
                          )}
                        </div>
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: TEXT, fontSize: 15 }}>{f["Full Name"] || "—"}</span>
                        <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{f["Email"] || ""}</span>
                        <Badge label="Fitter" color="blue" />
                        {f["Created"] && <span style={{ color: TEXT_MUTED, fontSize: 12 }}>{new Date(f["Created"]).toLocaleDateString("en-GB")}</span>}
                      </div>
                    </ExpandableRow>
                  );
                })
              )}
            </div>

            <div>
              <SectionHeader title="Pending Surveyors" count={data?.pendingSurveyors?.length} />
              {!data?.pendingSurveyors?.length ? (
                <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No pending surveyor applications.</p>
              ) : (
                data.pendingSurveyors.map((app) => {
                  const f = app.fields || {};
                  return (
                    <ExpandableRow key={app.id}
                      detail={
                        <div>
                          <div style={{ background: BG, borderRadius: 10, padding: 16, marginBottom: 12 }}>
                            {["Full Name", "Email", "Mobile", "Areas Covered", "Days Available", "Hours Available", "Comfortable Measuring", "Own Transport"].map((k) => f[k] && (
                              <div key={k} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                                <span style={{ color: TEXT_MUTED, fontSize: 13, minWidth: 140 }}>{k}</span>
                                <span style={{ color: TEXT, fontSize: 13 }}>{f[k]}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => approveApplication("surveyor", app.id)} style={{ flex: 1, padding: "10px", background: GOLD, color: BG, borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                            <button onClick={() => setMessageOpen(app.id)} style={{ flex: 1, padding: "10px", background: "transparent", color: TEXT_MUTED, borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, cursor: "pointer" }}>Message</button>
                          </div>
                          {messageOpen === app.id && (
                            <div style={{ marginTop: 12 }}>
                              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." rows={3}
                                style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                              <button onClick={() => sendMessage(app.id)} style={{ padding: "8px 20px", background: GOLD, color: BG, borderRadius: 6, border: "none", fontSize: 14, cursor: "pointer" }}>Send</button>
                            </div>
                          )}
                        </div>
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: TEXT, fontSize: 15 }}>{f["Full Name"] || "—"}</span>
                        <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{f["Email"] || ""}</span>
                        <Badge label="Surveyor" color="amber" />
                        {f["Created"] && <span style={{ color: TEXT_MUTED, fontSize: 12 }}>{new Date(f["Created"]).toLocaleDateString("en-GB")}</span>}
                      </div>
                    </ExpandableRow>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === "leads" && !loading && (
          <div>
            <SectionHeader title="All Leads" count={data?.leads?.length} />
            {!data?.leads?.length ? (
              <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No leads found.</p>
            ) : (
              data.leads.map((lead) => {
                const f = lead.fields || {};
                return (
                  <ExpandableRow key={lead.id}
                    detail={
                      <div style={{ background: BG, borderRadius: 10, padding: 16 }}>
                        {Object.entries(f).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                            <span style={{ color: TEXT_MUTED, fontSize: 13, minWidth: 140 }}>{k}</span>
                            <span style={{ color: TEXT, fontSize: 13 }}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ color: TEXT_MUTED, fontSize: 12, fontFamily: "monospace" }}>{f["Reference Number"] || lead.id.slice(-6)}</span>
                      <span style={{ color: TEXT, fontSize: 14 }}>{f["Name"] || "—"}</span>
                      <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{f["Postcode"] || "—"}</span>
                      <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{f["Flooring Type"] || "—"}</span>
                      {f["Budget"] && <span style={{ color: GOLD, fontSize: 13 }}>{f["Budget"]}</span>}
                      {f["Status"] && <Badge label={f["Status"]} color={f["Status"] === "Converted" ? "green" : "gold"} />}
                    </div>
                  </ExpandableRow>
                );
              })
            )}
          </div>
        )}

        {/* FLAGS TAB */}
        {activeTab === "flags" && !loading && (
          <div>
            <SectionHeader title="Open Flags" count={data?.flags?.length} />
            {!data?.flags?.length ? (
              <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No open flags.</p>
            ) : (
              data.flags.map((flag) => {
                const f = flag.fields || {};
                return (
                  <div key={flag.id} style={{ background: SURFACE, border: "1px solid rgba(224,112,112,0.25)", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <Badge label={f["Priority"] || "Medium"} color={f["Priority"] === "High" ? "red" : "amber"} />
                          {f["Created"] && <span style={{ color: TEXT_MUTED, fontSize: 12 }}>{new Date(f["Created"]).toLocaleString("en-GB")}</span>}
                        </div>
                        <p style={{ color: TEXT, fontSize: 14, lineHeight: 1.6, margin: "0 0 8px" }}>{f["Description"] || "—"}</p>
                        {f["Related Job"] && <p style={{ color: TEXT_MUTED, fontSize: 12, margin: 0 }}>Job: {f["Related Job"]}</p>}
                      </div>
                      <button onClick={() => resolveFlag(flag.id)} style={{ padding: "8px 16px", background: "transparent", color: "#6ec97a", border: "1px solid rgba(110,201,122,0.3)", borderRadius: 6, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                        Resolve
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === "revenue" && !loading && (
          <div>
            <SectionHeader title="Revenue" />
            {data?.revenue ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
                    <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 8px" }}>Month to date</p>
                    <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, margin: 0 }}>
                      £{data.revenue.monthTotal?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px" }}>
                    <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 8px" }}>Avg quality score</p>
                    <p style={{ color: data.revenue.avgScore >= 8 ? "#6ec97a" : data.revenue.avgScore >= 6 ? "#e0a050" : TEXT_MUTED, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, margin: 0 }}>
                      {data.revenue.avgScore || "—"}
                    </p>
                  </div>
                </div>
                {data.revenue.topFitter && (
                  <div style={{ background: "rgba(201,169,110,0.08)", border: `1px solid rgba(201,169,110,0.25)`, borderRadius: 12, padding: "16px 20px" }}>
                    <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 6px" }}>Top fitter this month</p>
                    <p style={{ color: GOLD, fontSize: 20, fontFamily: "'Cormorant Garamond', Georgia, serif", margin: 0 }}>{data.revenue.topFitter}</p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No revenue data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
