import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { description, rooms, propertyType } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are a UK flooring expert for Strata, a flooring company in Essex and London. Based on the customer description and their rooms, recommend the best flooring type and grade for each room. Be specific, warm, and knowledgeable. Consider practical factors like pets, children, underfloor heating, wet rooms. Return JSON only — no other text, no markdown fences.`,
      messages: [
        {
          role: "user",
          content: `Customer description: "${description}"\nRooms: ${rooms.join(", ")}\nProperty type: ${propertyType}\n\nReturn JSON only:\n{\n  "recommendations": [\n    {\n      "room": "Living Room",\n      "flooringType": "LVT",\n      "grade": "Mid",\n      "reason": "With a dog, LVT is the practical choice — fully waterproof, scratch resistant, and looks great.",\n      "warning": null,\n      "unsplashQuery": "luxury vinyl flooring living room modern"\n    }\n  ],\n  "generalAdvice": "With underfloor heating, avoid carpet and laminate — LVT and engineered wood are your best options."\n}`,
        },
      ],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: true }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]);

    const recommendations = (parsed.recommendations || []).map(rec => ({
      ...rec,
      unsplashPhoto: `https://source.unsplash.com/400x300/?${encodeURIComponent(rec.unsplashQuery || rec.flooringType + " flooring")}`,
    }));

    return Response.json({ ...parsed, recommendations });
  } catch (err) {
    console.error("[recommend] Error:", err);
    return Response.json({ error: true }, { status: 500 });
  }
}
