export async function POST(req) {
  try {
    const body = await req.json();

    const fields = {
      // Core identification
      "Reference Number":   body.reference_number,
      "Status":             body.status ?? "New",

      // Lane / customer type
      "Customer Type":      body.customer_type,
      "Lane Flag":          body.lane_flag,  // standard | high | urgent

      // Homeowner + landlord shared
      "Rooms":              body.rooms,
      "Total M2":           body.total_m2 ? parseFloat(body.total_m2) : undefined,
      "Room Data":          body.room_data,           // JSON string of per-room config
      "Mood Selections":    body.mood_selections,     // JSON: { "Living Room": "warm", ... }
      "Practical Flags":    body.practical_flags,     // JSON: { "Living Room": ["pets_children", ...] }

      // Landlord specific
      "Portfolio Size":     body.portfolio_size,
      "Property Type":      body.property_type,
      "Floor Condition":    body.floor_condition,
      "Priority Selection": body.priority_selection,

      // Commercial specific
      "Business Type":      body.business_type,
      "Footfall Level":     body.footfall_level,
      "Existing Floor":     body.existing_floor,
      "Timeline":           body.timeline,
      "Special Requirements": body.special_requirements,
      "Company":            body.company,
      "Email":              body.email,

      // Public sector specific
      "Organisation":       body.organisation,
      "Conversation Transcript": body.conversation_transcript,
      "Procurement Route":  body.procurement_route,

      // Contact
      "Name":               body.name,
      "Phone":              body.phone,
      "Postcode":           body.postcode,

      // Action requested
      "Action":             body.action,
    };

    // Remove undefined values so Airtable doesn't complain
    Object.keys(fields).forEach((k) => fields[k] === undefined && delete fields[k]);

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
    if (!airtableRes.ok) console.error("[submit] Airtable error:", JSON.stringify(airtableBody));

    return Response.json({ success: true, reference: body.reference_number });
  } catch (err) {
    console.error("[submit] Error:", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
