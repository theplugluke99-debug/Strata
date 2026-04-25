import { NextResponse } from "next/server";
import crypto from "crypto";

function hashPin(pin) {
  return crypto.createHash("sha256").update(pin + "strata_salt").digest("hex");
}

export async function POST(req) {
  try {
    const { email, pin, recordId } = await req.json();
    if (!email || !pin) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });

    let id = recordId;
    if (!id) {
      const res = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_SURVEYORS_TABLE)}?filterByFormula=${encodeURIComponent(`{Email}="${email}"`)}`,
        { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
      );
      const data = await res.json();
      const records = data.records || [];
      if (records.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      id = records[0].id;
    }

    const patchRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_SURVEYORS_TABLE)}/${id}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { "PIN Hash": hashPin(pin) } }),
      }
    );

    if (!patchRes.ok) return NextResponse.json({ success: false, error: "Failed to save PIN" }, { status: 500 });

    const updated = await patchRes.json();
    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.fields["Full Name"] || "",
        email: updated.fields["Email"] || "",
      },
    });
  } catch (err) {
    console.error("[surveyor/set-pin]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
