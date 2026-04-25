import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email } = await req.json();
    console.log(`[send-confirmation] Fitter confirmation for ${name} <${email}>`);
    // Email sending to be wired to provider later
    return NextResponse.json({ success: true, data: { sent: true } });
  } catch (err) {
    console.error("[send-confirmation]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
