import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const ref = "SRV-" + Date.now().toString(36).toUpperCase();

    const fields = {
      "Full Name": body.fullName || "",
      "Business Name": body.businessName || "",
      "Mobile": body.mobile || "",
      "Email": body.email || "",
      "Home Postcode": body.homePostcode || "",
      "Areas Covered": body.areasCovered || "",
      "Social Media": body.socialMedia || "",
      "Trade Experience": body.tradeExperience || "",
      "Comfortable Measuring": body.comfortableMeasuring || "",
      "Comfortable With App": body.comfortableWithApp || "",
      "Own Transport": body.ownTransport || "",
      "Days Available": Array.isArray(body.daysAvailable) ? body.daysAvailable.join(", ") : "",
      "Hours Available": Array.isArray(body.hoursAvailable) ? body.hoursAvailable.join(", ") : "",
      "Reference Number": ref,
      "Status": "Pending",
    };

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_SURVEYORS_TABLE)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("[surveyor/apply] Airtable error:", data);
      return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { reference: ref, recordId: data.id } });
  } catch (err) {
    console.error("[surveyor/apply]", err);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}
