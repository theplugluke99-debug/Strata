import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildHomeownerPrompt(roomData) {
  const rooms = roomData.map((r) =>
    `Room: ${r.room} | Flooring: ${r.flooringType} | Mood: ${r.mood} | Flags: ${(r.practicalFlags ?? []).join(", ") || "none"} | Area: ${r.area ? `${r.area}m²` : "TBC"}`
  ).join("\n");

  return {
    system: `You are Flo, Strata's AI flooring advisor. Give confident, clear tier recommendations for each room.

For each room return a JSON object with:
- room: room name
- recommended_tier: "Good", "Better", or "Best"
- reason: one sentence tied to the mood and practical flags
- good_note: brief note on the Good tier (entry level)
- best_note: brief note on the Best tier (over-spec context)

Return a JSON object: { "rooms": [ ... ] }

Rules:
- Sound like a knowledgeable friend, not a salesperson
- No markdown, no bullet lists in reasons — plain English sentences only
- Tie mood selections to recommendations (calm = neutral tones, warm = character materials, bold = strong contrast)
- Flag practical concerns: pets/children → durability spec; UFH → LVT or engineered; rental → mid spec
- Do not overwhelm — lead with the recommendation, show tiers as context`,
    user: `Please give tier recommendations for these rooms:\n\n${rooms}\n\nReturn valid JSON only, no other text.`,
  };
}

function buildLandlordPrompt(roomData, context) {
  const rooms = roomData.map((r) =>
    `Room: ${r.room} | Flooring: ${r.flooringType} | Area: ${r.area ? `${r.area}m²` : "TBC"}`
  ).join("\n");

  return {
    system: `You are Flo, Strata's AI flooring advisor for landlords and letting agents. Give practical, no-nonsense spec recommendations.

For each room return JSON with:
- room: room name
- recommended_tier: "Good", "Better", or "Best"
- reason: one practical sentence (no mood language)

Context: Priority = ${context?.priority ?? "balanced"}, Floor condition = ${context?.floorCondition ?? "unknown"}

Return: { "rooms": [ ... ] }

Rules: Practical rationale only. "Good" for cost-first, "Better" for balance, "Best" for durability-first. Flag prep requirements if floor condition is poor.`,
    user: `Recommend spec for these rooms:\n\n${rooms}\n\nReturn valid JSON only.`,
  };
}

function buildCommercialPrompt(context) {
  return {
    system: `You are Flo, Strata's AI flooring advisor for commercial projects. Give specification-grade recommendations with professional rationale.

Return a JSON object: { "proposal": { "text": "...", "spec": "...", "note": "..." } }

The "text" field should be 2-3 sentences of professional specification guidance. Include flooring type recommendations based on business type and footfall. The "spec" field: one-line spec summary. The "note" should be: "Commercial projects are individually quoted. We'll have a full proposal to you within 24 hours."`,
    user: `Business type: ${context.businessType}
Approx area: ${context.squareMeterage}m²
Footfall: ${context.footfallLevel}
Existing floor: ${context.existingFloor}
Timeline: ${context.timeline}
Requirements: ${(context.requirements ?? []).join(", ") || "none"}

Provide a commercial specification proposal. Return valid JSON only.`,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { laneType, roomData, context } = body;

    let prompts;
    if (laneType === "homeowner") {
      prompts = buildHomeownerPrompt(roomData ?? []);
    } else if (laneType === "landlord") {
      prompts = buildLandlordPrompt(roomData ?? [], context);
    } else if (laneType === "commercial") {
      prompts = buildCommercialPrompt(context ?? {});
    } else {
      return Response.json({ error: "Unknown lane type" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: [{ type: "text", text: prompts.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompts.user }],
    });

    const text = response.content[0]?.text ?? "{}";

    // Extract JSON
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("[flo/recommend] No JSON in response:", text.slice(0, 200));
      return Response.json({ rooms: [], proposal: { text: "Unable to generate recommendation at this time.", note: "Our team will follow up shortly." } });
    }

    const parsed = JSON.parse(match[0]);
    return Response.json(parsed);
  } catch (err) {
    console.error("[flo/recommend] error:", err?.message ?? err);
    return Response.json({ error: "Recommendation failed", rooms: [], proposal: { text: "Our team will prepare a tailored recommendation for you.", note: "We'll follow up shortly." } }, { status: 500 });
  }
}
