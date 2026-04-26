import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fitterId = searchParams.get("fitterId");
    if (!fitterId) {
      return NextResponse.json({ success: false, error: "Missing fitterId" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_FITTERS_TABLE)}/${fitterId}`,
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Profile fetch failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      data: {
        homePostcode: data.fields?.["Home Postcode"] || "",
        name: data.fields?.["Full Name"] || "",
      },
    });
  } catch (err) {
    console.error("[fitter/profile]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
