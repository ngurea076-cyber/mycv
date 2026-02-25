import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter, CVData } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvData, jobTitle, companyName, jobDescription } = body;

    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: "Job title and company name are required" },
        { status: 400 },
      );
    }

    const content = await generateCoverLetter(
      cvData as CVData,
      jobTitle,
      companyName,
      jobDescription || "",
    );

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Cover Letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}
