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

// ── UK tax bands 2025/26 ─────────────────────────────────────────
function calcTax(grossIncome, mileageDeduction) {
  const taxableProfit = Math.max(0, grossIncome - mileageDeduction);
  const personalAllowance = 12570;
  const basicRateLimit = 50270;
  const higherRateLimit = 125140;

  let incomeTax = 0;
  if (taxableProfit > personalAllowance) {
    const basicBand = Math.min(taxableProfit, basicRateLimit) - personalAllowance;
    incomeTax += Math.max(0, basicBand) * 0.20;
  }
  if (taxableProfit > basicRateLimit) {
    const higherBand = Math.min(taxableProfit, higherRateLimit) - basicRateLimit;
    incomeTax += Math.max(0, higherBand) * 0.40;
  }
  if (taxableProfit > higherRateLimit) {
    incomeTax += (taxableProfit - higherRateLimit) * 0.45;
  }

  // Class 4 NI: 9% on £12,570–£50,270, 2% above
  let ni = 0;
  if (taxableProfit > personalAllowance) {
    const niBasic = Math.min(taxableProfit, basicRateLimit) - personalAllowance;
    ni += Math.max(0, niBasic) * 0.09;
  }
  if (taxableProfit > basicRateLimit) {
    ni += (taxableProfit - basicRateLimit) * 0.02;
  }

  return { taxableProfit, incomeTax: Math.round(incomeTax), ni: Math.round(ni), totalLiability: Math.round(incomeTax + ni) };
}

// Rough straight-line distance between two UK outcode centroids (very approximate)
const OUTCODE_COORDS = {
  RM: [51.552, 0.170], E: [51.520, -0.044], IG: [51.558, 0.083], CM: [51.735, 0.470],
  SS: [51.558, 0.710], EN: [51.652, -0.082], N: [51.558, -0.108], NW: [51.545, -0.185],
  W: [51.509, -0.203], WC: [51.518, -0.120], EC: [51.516, -0.092], SE: [51.475, -0.049],
  SW: [51.466, -0.178], CR: [51.374, -0.099], BR: [51.404, 0.017], DA: [51.442, 0.218],
};
function roughMiles(postA, postB) {
  if (!postA || !postB) return null;
  const outA = (postA.match(/^[A-Za-z]{1,2}/) || [])[0]?.toUpperCase();
  const outB = (postB.match(/^[A-Za-z]{1,2}/) || [])[0]?.toUpperCase();
  const cA = OUTCODE_COORDS[outA];
  const cB = OUTCODE_COORDS[outB];
  if (!cA || !cB) return null;
  const R = 3959;
  const dLat = ((cB[0] - cA[0]) * Math.PI) / 180;
  const dLon = ((cB[1] - cA[1]) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((cA[0] * Math.PI) / 180) * Math.cos((cB[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const TAX_KEY_DATES = [
  { date: "5 April", label: "End of tax year", note: "Last day of the 2025/26 tax year. Any remaining allowances or deductions expire." },
  { date: "6 April", label: "New tax year begins", note: "Your personal allowance and NI thresholds reset for 2026/27." },
  { date: "31 July", label: "Second payment on account", note: "If you pay tax by instalments, your second payment on account is due." },
  { date: "5 October", label: "Self Assessment registration", note: "Deadline to register for Self Assessment if this is your first year as self-employed." },
  { date: "31 January", label: "Tax return & balancing payment", note: "File your Self Assessment return and pay any balancing payment plus first payment on account for next year." },
];

function EarningsTab({ allJobs, fitterPostcode }) {
  const now = new Date();
  const taxYearStart = now.getMonth() >= 3 ? new Date(now.getFullYear(), 3, 6) : new Date(now.getFullYear() - 1, 3, 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paidJobs = allJobs.filter((j) => j.fields?.Status === "Paid");
  const monthJobs = paidJobs.filter((j) => {
    const d = j.fields?.["Completion Date"] || j.fields?.["Created"] || "";
    return d ? new Date(d) >= monthStart : false;
  });
  const taxYearJobs = paidJobs.filter((j) => {
    const d = j.fields?.["Completion Date"] || j.fields?.["Created"] || "";
    return d ? new Date(d) >= taxYearStart : false;
  });

  const monthGross = monthJobs.reduce((s, j) => s + (parseFloat(j.fields?.Earnings) || 0), 0);
  const taxYearGross = taxYearJobs.reduce((s, j) => s + (parseFloat(j.fields?.Earnings) || 0), 0);

  // Mileage
  const jobsWithMileage = paidJobs.map((j) => {
    const miles = roughMiles(fitterPostcode, j.fields?.Postcode || j.fields?.["Job Postcode"] || "");
    return { ...j, miles: miles ? miles * 2 : null }; // round trip
  });
  const monthMiles = jobsWithMileage.filter((j) => {
    const d = j.fields?.["Completion Date"] || j.fields?.["Created"] || "";
    return d ? new Date(d) >= monthStart : false;
  }).reduce((s, j) => s + (j.miles || 0), 0);
  const taxYearMiles = jobsWithMileage.filter((j) => {
    const d = j.fields?.["Completion Date"] || j.fields?.["Created"] || "";
    return d ? new Date(d) >= taxYearStart : false;
  }).reduce((s, j) => s + (j.miles || 0), 0);

  const mileageAllowance = taxYearMiles <= 10000
    ? taxYearMiles * 0.45
    : 10000 * 0.45 + (taxYearMiles - 10000) * 0.25;

  const tax = calcTax(taxYearGross, mileageAllowance);

  const downloadSummary = () => {
    const lines = [
      "STRATA — TAX YEAR SUMMARY",
      `Tax year: ${taxYearStart.getFullYear()}/${taxYearStart.getFullYear() + 1}`,
      `Generated: ${now.toLocaleDateString("en-GB")}`,
      "",
      "EARNINGS",
      `Gross income from Strata: £${taxYearGross.toFixed(2)}`,
      `Jobs completed: ${taxYearJobs.length}`,
      "",
      "MILEAGE",
      `Total miles (tax year): ${taxYearMiles} miles`,
      `Mileage allowance (HMRC 45p/mile first 10k): £${mileageAllowance.toFixed(2)}`,
      "",
      "TAX ESTIMATE",
      `Taxable profit: £${tax.taxableProfit.toFixed(2)}`,
      `Estimated income tax: £${tax.incomeTax}`,
      `Estimated Class 4 NI: £${tax.ni}`,
      `Total estimated liability: £${tax.totalLiability}`,
      "",
      "DISCLAIMER",
      "This is an estimate only. Figures do not account for other income, expenses, or pension contributions.",
      "Please consult an accountant or HMRC for your actual tax liability.",
      "Self Assessment: www.gov.uk/self-assessment-tax-returns",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strata-tax-summary-${taxYearStart.getFullYear()}-${taxYearStart.getFullYear() + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const row = (label, value, highlight) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{label}</span>
      <span style={{ color: highlight ? GOLD : TEXT, fontSize: highlight ? 18 : 15, fontFamily: highlight ? "'Cormorant Garamond', Georgia, serif" : "system-ui" }}>{value}</span>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400, color: TEXT, marginBottom: 6 }}>Earnings & tax</h2>
      <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>A running picture of your income and what you might owe.</p>

      {/* Month summary */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 20px", marginBottom: 24 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 16px" }}>This month</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
          <div>
            <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Gross earnings</p>
            <p style={{ color: GOLD, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, margin: 0 }}>£{monthGross.toFixed(2)}</p>
          </div>
          <div>
            <p style={{ color: TEXT_MUTED, fontSize: 12, margin: "0 0 4px" }}>Jobs completed</p>
            <p style={{ color: TEXT, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, margin: 0 }}>{monthJobs.length}</p>
          </div>
        </div>
      </div>

      {/* Mileage tracker */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", marginBottom: 24 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 16px" }}>Mileage tracker</p>
        <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
          Approximate return mileage home→job using postcode district centroids. Confirm exact mileage in your own records.
        </p>
        {row("Miles this month", `${monthMiles} miles`)}
        {row("Miles this tax year", `${taxYearMiles} miles`)}
        {row("Mileage allowance (45p/mile)", `£${mileageAllowance.toFixed(2)}`, true)}
        <p style={{ color: TEXT_MUTED, fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
          HMRC: 45p per mile for first 10,000 miles, then 25p. Deducted from taxable profit.
        </p>
      </div>

      {/* Tax summary */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px", marginBottom: 24 }}>
        <p style={{ color: TEXT_MUTED, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 16px" }}>
          Tax estimate — {taxYearStart.getFullYear()}/{String(taxYearStart.getFullYear() + 1).slice(2)}
        </p>
        {row("Gross income (Strata only)", `£${taxYearGross.toFixed(2)}`)}
        {row("Mileage deduction", `– £${mileageAllowance.toFixed(2)}`)}
        {row("Estimated taxable profit", `£${tax.taxableProfit.toFixed(2)}`, true)}
        {row("Income tax estimate", `£${tax.incomeTax.toLocaleString("en-GB")}`)}
        {row("Class 4 NI estimate", `£${tax.ni.toLocaleString("en-GB")}`)}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 4px" }}>
          <span style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>Total estimated liability</span>
          <span style={{ color: "#e0a050", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22 }}>£{tax.totalLiability.toLocaleString("en-GB")}</span>
        </div>
        <div style={{ background: "rgba(224,160,80,0.07)", border: "1px solid rgba(224,160,80,0.2)", borderRadius: 8, padding: "10px 14px", marginTop: 12 }}>
          <p style={{ color: TEXT_MUTED, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: "#e0a050" }}>Disclaimer:</strong> This is a rough estimate based on Strata income only. It doesn&apos;t account for other income sources, other business expenses, pension contributions, or personal circumstances. Speak to an accountant or visit <span style={{ color: GOLD }}>gov.uk/self-assessment</span> for your actual liability.
          </p>
        </div>
      </div>

      {/* Key dates */}
      <p style={{ color: TEXT_MUTED, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 12px" }}>Key dates</p>
      {TAX_KEY_DATES.map((item, i) => (
        <GoldCard key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p style={{ color: GOLD, fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{item.label}</p>
              <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{item.note}</p>
            </div>
            <span style={{ color: GOLD, fontSize: 12, fontFamily: "'Cormorant Garamond', Georgia, serif", flexShrink: 0, fontWeight: 600 }}>{item.date}</span>
          </div>
        </GoldCard>
      ))}

      {/* Download */}
      <button onClick={downloadSummary} style={{ width: "100%", marginTop: 8, padding: "16px", background: "transparent", color: GOLD, borderRadius: 10, border: `1px solid rgba(201,169,110,0.4)`, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
        Download tax year summary
      </button>
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
  const [materialsSpec, setMaterialsSpec] = useState(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [allJobs, setAllJobs] = useState([]);
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
        setAllJobs(data.data);
        if (active?.fields?.Status === "Accepted") {
          fetchMaterialsSpec(active.fields);
        }
        const paid = data.data.filter((r) => r.fields?.Status === "Paid");
        const total = paid.reduce((s, r) => s + (parseFloat(r.fields?.Earnings) || 0), 0);
        setMonthEarnings(total.toFixed(2));
      }
    } catch { setError("Couldn't load your jobs right now."); }
    setLoading(false);
  };

  const fetchMaterialsSpec = async (fields) => {
    try {
      const rooms = fields["Room Names"]
        ? fields["Room Names"].split(",").map((n, i) => ({ name: n.trim(), subfloorType: fields["Subfloor Type"] || "", existingFlooring: fields["Existing Flooring"] || "", grossM2: (parseFloat(fields["Approximate M2"]) || 20) / (fields["Room Names"].split(",").length || 1) }))
        : [{ name: "Main area", grossM2: parseFloat(fields["Approximate M2"]) || 20, subfloorType: fields["Subfloor Type"] || "", existingFlooring: fields["Existing Flooring"] || "" }];
      const res = await fetch("/api/materials/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flooringType: fields["Flooring Type"] || "LVT", rooms, serviceType: "Supply and fit" }),
      });
      const data = await res.json();
      if (data.success) setMaterialsSpec(data.data);
    } catch { /* silent — spec card is supplementary */ }
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

        {/* Tab navigation */}
        <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, marginBottom: 28 }}>
          <button onClick={() => setActiveTab("jobs")} style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", borderBottom: activeTab === "jobs" ? `2px solid ${GOLD}` : "2px solid transparent", color: activeTab === "jobs" ? GOLD : TEXT_MUTED, fontSize: 14, cursor: "pointer", fontFamily: "system-ui" }}>Jobs</button>
          <button onClick={() => setActiveTab("earnings")} style={{ flex: 1, padding: "12px 0", background: "transparent", border: "none", borderBottom: activeTab === "earnings" ? `2px solid ${GOLD}` : "2px solid transparent", color: activeTab === "earnings" ? GOLD : TEXT_MUTED, fontSize: 14, cursor: "pointer", fontFamily: "system-ui" }}>Earnings</button>
        </div>

        {activeTab === "jobs" && (<>

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

            {/* Materials spec card */}
            {materialsSpec && (
              <GoldCard style={{ marginBottom: 24 }}>
                <p style={{ color: GOLD, fontSize: 12, fontWeight: 600, margin: "0 0 12px", fontFamily: "system-ui", letterSpacing: 1 }}>MATERIALS SPEC</p>
                {materialsSpec.doorBars?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ color: TEXT_MUTED, fontSize: 11, margin: "0 0 6px", fontFamily: "system-ui", letterSpacing: 1, textTransform: "uppercase" }}>Door bars</p>
                    {materialsSpec.doorBars.map((bar, i) => (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <span style={{ color: TEXT, fontSize: 13, fontFamily: "system-ui" }}>{bar.type}</span>
                        <span style={{ color: TEXT_MUTED, fontSize: 12, fontFamily: "system-ui" }}> — {bar.location} ({bar.widthMM}mm)</span>
                        <p style={{ color: TEXT_MUTED, fontSize: 11, margin: "2px 0 0", fontFamily: "system-ui", lineHeight: 1.5 }}>{bar.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
                {materialsSpec.underlay && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ color: TEXT_MUTED, fontSize: 11, margin: "0 0 6px", fontFamily: "system-ui", letterSpacing: 1, textTransform: "uppercase" }}>Underlay</p>
                    <p style={{ color: TEXT, fontSize: 13, fontFamily: "system-ui", margin: 0 }}>{materialsSpec.underlay.type} — {materialsSpec.underlay.m2Required} m²</p>
                    <p style={{ color: TEXT_MUTED, fontSize: 11, fontFamily: "system-ui", margin: "2px 0 0" }}>{materialsSpec.gripperRods?.linearMetres > 0 && `${materialsSpec.gripperRods.linearMetres}m gripper rods`}</p>
                  </div>
                )}
                {materialsSpec.plyBoarding?.required && (
                  <div>
                    <p style={{ color: TEXT_MUTED, fontSize: 11, margin: "0 0 4px", fontFamily: "system-ui", letterSpacing: 1, textTransform: "uppercase" }}>Ply boarding</p>
                    <p style={{ color: "#e0a050", fontSize: 13, fontFamily: "system-ui", margin: 0 }}>Required — {materialsSpec.plyBoarding.reason}</p>
                  </div>
                )}
              </GoldCard>
            )}

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
        </>)}

        {activeTab === "earnings" && (
          <EarningsTab allJobs={allJobs} fitterPostcode={fitter?.homePostcode} />
        )}

      </div>
    </div>
  );
}
