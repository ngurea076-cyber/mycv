import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, skills } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const summary = await generateSummary(role, skills || []);

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("AI Summary error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 },
    );
  }
}
