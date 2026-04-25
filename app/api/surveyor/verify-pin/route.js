import { NextResponse } from "next/server";
import crypto from "crypto";

function hashPin(pin) {
  return crypto.createHash("sha256").update(pin + "strata_salt").digest("hex");
}

export async function POST(req) {
  try {
    const { email, pin } = await req.json();
    if (!email || !pin) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_SURVEYORS_TABLE)}?filterByFormula=${encodeURIComponent(`{Email}="${email}"`)}`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
    );

    const data = await res.json();
    const records = data.records || [];
    if (records.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const record = records[0];
    const storedHash = record.fields["PIN Hash"] || "";

    if (!storedHash) {
      return NextResponse.json({ success: false, data: { needsPin: true, recordId: record.id } });
    }

    if (storedHash !== hashPin(pin)) {
      return NextResponse.json({ success: false, error: "Invalid PIN" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        name: record.fields["Full Name"] || "",
        email: record.fields["Email"] || "",
        status: record.fields["Status"] || "",
      },
    });
  } catch (err) {
    console.error("[surveyor/verify-pin]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
