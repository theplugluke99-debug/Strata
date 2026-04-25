import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fitterId = searchParams.get("fitterId");
    if (!fitterId) return NextResponse.json({ success: false, error: "Missing fitterId" }, { status: 400 });

    const filter = encodeURIComponent(`{Fitter ID}="${fitterId}"`);
    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_JOBS_TABLE)}?filterByFormula=${filter}&sort[0][field]=Created&sort[0][direction]=desc`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
    );
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.records || [] });
  } catch (err) {
    console.error("[fitter/jobs GET]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { jobId, status, note, photos, aiScore, aiNotes } = body;
    if (!jobId) return NextResponse.json({ success: false, error: "Missing jobId" }, { status: 400 });

    const fields = {};
    if (status) fields["Status"] = status;
    if (note) fields["Fitter Note"] = note;
    if (photos) fields["Photos"] = photos;
    if (aiScore !== undefined) fields["AI Score"] = aiScore;
    if (aiNotes) fields["AI Notes"] = aiNotes;

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_JOBS_TABLE)}/${jobId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      }
    );

    if (!res.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.fields });
  } catch (err) {
    console.error("[fitter/jobs POST]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
