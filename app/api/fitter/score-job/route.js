import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { images } = await req.json();
    if (!images || images.length === 0) {
      return NextResponse.json({ success: false, error: "No images provided" }, { status: 400 });
    }

    const imageContent = images.map((base64) => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: base64.replace(/^data:image\/\w+;base64,/, "") },
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: "You are a flooring quality inspector for Strata, a premium UK flooring company. Score this completed flooring installation. Look for: edge quality at skirting boards, seam quality, door bar finish, pattern matching if applicable, overall cleanliness of finish, any visible issues. Return JSON only: { score: number (1-10), summary: string, positives: string[], improvements: string[], flaggedAreas: string[] }",
      messages: [
        {
          role: "user",
          content: [
            ...imageContent,
            { type: "text", text: "Please score and assess this completed flooring installation." },
          ],
        },
      ],
    });

    const text = response.content[0].text;
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { score: 7, summary: text, positives: [], improvements: [], flaggedAreas: [] };
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[fitter/score-job]", err);
    return NextResponse.json({ success: false, error: "Scoring failed" }, { status: 500 });
  }
}
