import Anthropic from "@anthropic-ai/sdk";
import { FLO_SYSTEM_PROMPT } from "@/lib/flo-prompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CONTEXT_NOTE = {
  customer:
    "The person you are speaking with right now is a **customer** — a homeowner or tenant choosing, buying, or troubleshooting flooring. Speak warmly and in plain English. Avoid trade jargon unless you explain it immediately.",
  fitter:
    "The person you are speaking with right now is a **fitter** — a professional flooring installer. Speak to them as a colleague. Technical language is welcome. Focus on installation technique, subfloor assessment, safety, and earnings questions.",
  surveyor:
    "The person you are speaking with right now is a **surveyor** — a professional conducting home visits to assess flooring requirements. Focus on site assessment, sample presentation, customer communication, survey reporting, and earnings questions.",
};

export async function POST(req) {
  console.log("[flo] POST called");
  try {
    const body = await req.json();
    console.log("[flo] body:", JSON.stringify(body).slice(0, 200));
    const { message, context, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const activeContext =
      context && CONTEXT_NOTE[context] ? context : "customer";

    const systemPrompt = `${FLO_SYSTEM_PROMPT}\n\n---\n\n${CONTEXT_NOTE[activeContext]}`;

    console.log("[flo] system prompt length:", systemPrompt.length);

    const historyMessages = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string"
          )
          .slice(-18)
      : [];

    const messages = [
      ...historyMessages,
      { role: "user", content: message.trim() },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const reply = response.content[0]?.text ?? "";

    return Response.json({ reply });
  } catch (err) {
    console.error("[flo] error:", err?.message || err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
