import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const ref = "FIT-" + Date.now().toString(36).toUpperCase();

    const fields = {
      "Full Name": body.fullName || "",
      "Trading Name": body.tradingName || "",
      "Companies House Number": body.companiesHouseNumber || "",
      "Mobile": body.mobile || "",
      "Email": body.email || "",
      "Home Postcode": body.homePostcode || "",
      "Areas Covered": body.areasCovered || "",
      "Social Media": body.socialMedia || "",
      "Flooring Types": Array.isArray(body.flooringTypes) ? body.flooringTypes.join(", ") : "",
      "Years Experience": body.yearsExperience || "",
      "Works Solo Or Team": body.worksSoloOrTeam || "",
      "Has Own Van": body.hasOwnVan || "",
      "Has Public Liability Insurance": body.hasInsurance || "",
      "Insurance Certificate": body.insuranceCertificate || "",
      "Portfolio Photos": body.portfolioPhotos || "",
      "Reference Number": ref,
      "Status": "Pending",
    };

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_FITTERS_TABLE)}`,
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
      console.error("[fitter/apply] Airtable error:", data);
      return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { reference: ref, recordId: data.id } });
  } catch (err) {
    console.error("[fitter/apply]", err);
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}
