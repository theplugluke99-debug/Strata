import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { flagId } = await req.json();
    if (!flagId) return NextResponse.json({ success: false, error: "Missing flagId" }, { status: 400 });

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_FLAGS_TABLE)}/${flagId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { Status: "Resolved" } }),
      }
    );

    if (!res.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[operator/resolve-flag]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
