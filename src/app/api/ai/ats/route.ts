import { NextRequest, NextResponse } from "next/server";
import { analyzeATS, CVData } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvData, jobDescription } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    const result = await analyzeATS(cvData as CVData, jobDescription);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ATS Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze ATS" },
      { status: 500 },
    );
  }
}
