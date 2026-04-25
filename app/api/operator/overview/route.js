import { NextResponse } from "next/server";

async function fetchTable(tableName, filter) {
  const url = new URL(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`);
  if (filter) url.searchParams.set("filterByFormula", filter);
  url.searchParams.set("sort[0][field]", "Created");
  url.searchParams.set("sort[0][direction]", "desc");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
  });
  const data = await res.json();
  return data.records || [];
}

export async function GET() {
  try {
    const [fitters, surveyors, jobs, visits, flags, leads] = await Promise.all([
      fetchTable(process.env.AIRTABLE_FITTERS_TABLE, `{Status}="Pending"`),
      fetchTable(process.env.AIRTABLE_SURVEYORS_TABLE, `{Status}="Pending"`),
      fetchTable(process.env.AIRTABLE_JOBS_TABLE, `NOT({Status}="Paid")`),
      fetchTable(process.env.AIRTABLE_VISITS_TABLE, `NOT({Status}="Paid")`),
      fetchTable(process.env.AIRTABLE_FLAGS_TABLE, `{Status}="Open"`),
      fetchTable("Quote Requests1"),
    ]);

    const paidJobs = await fetchTable(process.env.AIRTABLE_JOBS_TABLE, `{Status}="Paid"`);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPaid = paidJobs.filter((r) => {
      const created = r.fields["Created"] ? new Date(r.fields["Created"]) : null;
      return created && created >= monthStart;
    });
    const monthRevenue = monthPaid.reduce((sum, r) => sum + (parseFloat(r.fields["Earnings"]) || 0), 0);
    const scores = monthPaid.map((r) => parseFloat(r.fields["AI Score"])).filter(Boolean);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;

    const fitterCounts = {};
    monthPaid.forEach((r) => {
      const name = r.fields["Fitter Name"] || "Unknown";
      fitterCounts[name] = (fitterCounts[name] || 0) + 1;
    });
    const topFitter = Object.entries(fitterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        pendingFitters: fitters,
        pendingSurveyors: surveyors,
        activeJobs: jobs,
        activeVisits: visits,
        flags,
        leads,
        revenue: { monthTotal: monthRevenue, avgScore, topFitter },
      },
    });
  } catch (err) {
    console.error("[operator/overview]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
