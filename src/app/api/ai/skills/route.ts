import { NextRequest, NextResponse } from "next/server";
import { suggestSkills } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const skills = await suggestSkills(role);

    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error("AI Skills error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to suggest skills" },
      { status: 500 },
    );
  }
}
