import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const surveyorId = searchParams.get("surveyorId");
    if (!surveyorId) return NextResponse.json({ success: false, error: "Missing surveyorId" }, { status: 400 });

    const filter = encodeURIComponent(`{Surveyor ID}="${surveyorId}"`);
    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_VISITS_TABLE)}?filterByFormula=${filter}&sort[0][field]=Created&sort[0][direction]=desc`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
    );
    const data = await res.json();
    return NextResponse.json({ success: true, data: data.records || [] });
  } catch (err) {
    console.error("[surveyor/visits GET]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { visitId, status, report, photos } = body;
    if (!visitId) return NextResponse.json({ success: false, error: "Missing visitId" }, { status: 400 });

    const fields = {};
    if (status) fields["Status"] = status;
    if (report) fields["Report"] = JSON.stringify(report);
    if (photos) fields["Photos"] = photos;

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_VISITS_TABLE)}/${visitId}`,
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
    console.error("[surveyor/visits POST]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
