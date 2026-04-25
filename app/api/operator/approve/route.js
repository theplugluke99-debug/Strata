import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { type, recordId } = await req.json();
    if (!type || !recordId) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });

    const table = type === "fitter"
      ? process.env.AIRTABLE_FITTERS_TABLE
      : process.env.AIRTABLE_SURVEYORS_TABLE;

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${recordId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { Status: "Approved" } }),
      }
    );

    if (!res.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[operator/approve]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
