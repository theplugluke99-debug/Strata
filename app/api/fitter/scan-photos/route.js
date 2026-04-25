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
      max_tokens: 500,
      system: "You are a flooring quality inspector for Strata, a premium UK flooring company. Analyse these before-installation photos and provide a brief, useful note for the fitter. Be helpful and specific. Look for subfloor condition, any obvious issues, levelness. Return JSON only: { note: string, flags: string[], confidence: string }",
      messages: [
        {
          role: "user",
          content: [
            ...imageContent,
            { type: "text", text: "Please analyse these before-installation photos." },
          ],
        },
      ],
    });

    const text = response.content[0].text;
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { note: text, flags: [], confidence: "medium" };
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[fitter/scan-photos]", err);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
