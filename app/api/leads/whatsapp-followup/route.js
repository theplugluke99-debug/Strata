import { NextResponse } from "next/server";

// This route is called ~30 mins after a quote submission to trigger a WhatsApp follow-up
// When Twilio WhatsApp is wired in, this sends the actual message
// For now, it just logs what would be sent

export async function POST(req) {
  try {
    const { name, phone, reference } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "Missing name or phone" }, { status: 400 });
    }

    // This is the exact template that will be sent via WhatsApp
    const message = `Hi ${name?.split(" ")[0]} — it's Strata. We've got your quote ready. Your free survey takes about 40 minutes and there's absolutely no obligation to go ahead. Want to pick a time that suits you? Reply here or call us on 020 1234 5678.`;

    // TODO: When Twilio WhatsApp is integrated, send the actual message here
    // For now, just log what would be sent
    console.log("[WhatsApp Follow-up]", {
      to: phone,
      name,
      reference,
      message,
      scheduledAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, scheduled: true, message });
  } catch (err) {
    console.error("[leads/whatsapp-followup]", err);
    return NextResponse.json({ success: false, error: "Failed to schedule follow-up" }, { status: 500 });
  }
}
