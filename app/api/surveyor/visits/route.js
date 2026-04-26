import { NextResponse } from "next/server";
import { generateMaterialsSpec } from "@/lib/materials-spec";

async function getVisitRecord(visitId) {
  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_VISITS_TABLE)}/${visitId}`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` } }
  );
  return res.ok ? res.json() : null;
}

async function patchJobMaterials(jobId, materialsSpec) {
  return fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_JOBS_TABLE)}/${jobId}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { "Materials Spec": JSON.stringify(materialsSpec) } }),
    }
  );
}

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

    const visitRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_VISITS_TABLE)}/${visitId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      }
    );

    if (!visitRes.ok) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    const visitData = await visitRes.json();

    if (status === "Report Submitted" && report && report.rooms && report.rooms.length > 0) {
      const visitRecord = await getVisitRecord(visitId);
      const relatedJob = visitRecord?.fields?.["Related Job"] || visitRecord?.fields?.["Job"] || visitRecord?.fields?.["Job ID"];
      const jobId = Array.isArray(relatedJob) ? relatedJob[0] : relatedJob;

      if (jobId) {
        const serviceType = visitRecord?.fields?.["Service Type"] || "Supply and fit";
        const flooringType = visitRecord?.fields?.["Flooring Interest"] || report?.flooringType || "Unknown";
        const materialsSpec = generateMaterialsSpec({ flooringType, rooms: report.rooms, serviceType });
        await patchJobMaterials(jobId, materialsSpec);
      }
    }

    return NextResponse.json({ success: true, data: visitData.fields });
  } catch (err) {
    console.error("[surveyor/visits POST]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
