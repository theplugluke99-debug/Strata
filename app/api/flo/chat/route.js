import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FLO_SYSTEM_PROMPT } from "@/lib/flo-prompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function contextPrompt(context, userContext = {}) {
  const common = [];
  if (context === "fitter") {
    common.push(
      "You are speaking to a fitter on site. Keep the tone professional but friendly, and answer like a colleague who knows flooring and installation details.",
      "Be especially helpful with subfloor prep, door bars, transitions, materials, and earnings when asked.",
      "If current job details are provided, use them to ground your advice."
    );
  }
  if (context === "surveyor") {
    common.push(
      "You are speaking to a surveyor preparing for or submitting a survey. Focus on what samples to bring, what subfloor details matter, and how to capture the right information in the report.",
      "If the customer is interested in specific flooring types, mention the implications for survey and installation.",
      "Keep the tone warm but practical."
    );
  }
  if (context === "customer") {
    common.push(
      "You are speaking to a customer who wants simple, clear flooring advice. Avoid technical jargon unless it helps, and always explain the practical outcome.");
  }

  const contextLines = [
    `Conversation context: ${context || "customer"}`,
    `User context: ${JSON.stringify(userContext || {}, null, 0)}`,
    ...common,
  ];
  return contextLines.join(" \n");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, userContext, context = "customer" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: "Missing messages" }, { status: 400 });
    }

    const prompt = `${FLO_SYSTEM_PROMPT}\n\n${contextPrompt(context, userContext)}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: prompt,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    const text = response?.content?.[0]?.text || "Sorry, I couldn't generate a response right now.";
    return NextResponse.json({ success: true, response: text });
  } catch (err) {
    console.error("[flo/chat]", err);
    return NextResponse.json({ success: false, error: "Flo is unavailable right now." }, { status: 500 });
  }
}
