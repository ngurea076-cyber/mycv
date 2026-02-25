import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Only fetch active testimonials
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(7);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching active testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch active testimonials" },
      { status: 500 },
    );
  }
}
