export async function POST(req) {
  try {
    const body = await req.json();

    const fields = {
      "Reference Number": body.reference_number,
      "Property Type":    body.property_type,
      "Rooms":            body.rooms,
      "Total M2":         parseFloat(body.total_m2),
      "Flooring Type":    body.flooring_type,
      "Flooring Grade":   body.flooring_grade,
      "Current Floor":    body.current_floor,
      "Subfloor Type":    body.subfloor_type,
      "Extras":           body.extras,
      "Budget":           body.budget_range,
      "Timing":           body.timing,
      "Service Type":     body.service_type,
      "Name":             body.name,
      "Phone":            body.phone,
      "Postcode":         body.postcode,
      "Status":           body.status,
    };

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Quote%20Requests1`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );

    const airtableBody = await airtableRes.json();
    console.log("[submit] Airtable status:", airtableRes.status);
    console.log("[submit] Airtable response:", JSON.stringify(airtableBody, null, 2));

    return Response.json({ success: true });
  } catch (err) {
    console.error("[submit] Error:", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
