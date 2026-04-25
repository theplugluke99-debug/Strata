import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { roomLabel, image } = await req.json();
    if (!image) return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: "You are a flooring survey assistant for Strata, a premium UK flooring company. Analyse this room photo from a survey visit. Identify: subfloor type if visible, existing flooring condition, approximate room size estimate, any issues that should be flagged. Return JSON only: { subfloorObservation: string, existingFlooringObservation: string, issuesSpotted: string[], generalNotes: string }",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: image.replace(/^data:image\/\w+;base64,/, "") },
            },
            { type: "text", text: `Please analyse this room photo for the survey report. Room: ${roomLabel || "Unknown"}` },
          ],
        },
      ],
    });

    const text = response.content[0].text;
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { subfloorObservation: "", existingFlooringObservation: text, issuesSpotted: [], generalNotes: "" };
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[surveyor/analyse-photos]", err);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
