import { NextResponse } from "next/server";
import { generateMaterialsSpec } from "@/lib/materials-spec";

export async function POST(req) {
  try {
    const body = await req.json();
    const { flooringType, rooms, serviceType } = body;

    if (!flooringType || !serviceType || !Array.isArray(rooms)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const spec = generateMaterialsSpec({ flooringType, rooms, serviceType });
    return NextResponse.json({ success: true, data: spec });
  } catch (err) {
    console.error("[materials/spec]", err);
    return NextResponse.json({ success: false, error: "Could not generate materials spec" }, { status: 500 });
  }
}
