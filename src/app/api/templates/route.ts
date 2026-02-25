import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    let query = supabaseAdmin
      .from("templates")
      .select("*")
      .eq("is_active", true);

    if (type) {
      query = query.eq("type", type);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data: templates, error } = await query.order("name");

    if (error) {
      console.error("Templates fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 },
      );
    }

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("Templates error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 },
    );
  }
}
