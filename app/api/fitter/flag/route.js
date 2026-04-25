import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { description, relatedJobId } = await req.json();
    if (!description) return NextResponse.json({ success: false, error: "Missing description" }, { status: 400 });

    const fields = {
      Description: description,
      Status: "Open",
      Priority: "Medium",
    };
    if (relatedJobId) fields["Related Job"] = relatedJobId;

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_FLAGS_TABLE)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      }
    );

    if (!res.ok) return NextResponse.json({ success: false, error: "Failed to create flag" }, { status: 500 });
    const data = await res.json();
    return NextResponse.json({ success: true, data: { id: data.id } });
  } catch (err) {
    console.error("[fitter/flag]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
