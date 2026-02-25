import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, company, content, avatar, is_active } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 },
      );
    }

    // Check if activating and count active testimonials
    if (is_active) {
      const { count } = await supabaseAdmin
        .from("testimonials")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (count !== null && count >= 7) {
        return NextResponse.json(
          {
            error:
              "Maximum 7 testimonials can be active at a time. Please deactivate one first.",
          },
          { status: 400 },
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .insert([
        {
          name,
          role,
          company,
          content,
          avatar:
            avatar ||
            name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
          is_active: is_active || false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role, company, content, avatar, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // If activating, check the limit
    if (is_active) {
      // Get current testimonial to check if it's already active
      const { data: currentTestimonial } = await supabaseAdmin
        .from("testimonials")
        .select("is_active")
        .eq("id", id)
        .single();

      // Only count if the testimonial isn't already active
      if (!currentTestimonial?.is_active) {
        const { count } = await supabaseAdmin
          .from("testimonials")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        if (count !== null && count >= 7) {
          return NextResponse.json(
            {
              error:
                "Maximum 7 testimonials can be active at a time. Please deactivate one first.",
            },
            { status: 400 },
          );
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .update({
        name,
        role,
        company,
        content,
        avatar,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 },
    );
  }
}
