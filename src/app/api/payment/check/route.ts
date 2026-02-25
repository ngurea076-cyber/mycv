import { NextRequest, NextResponse } from "next/server";
import { querySTKStatus } from "@/lib/mpesa";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkoutRequestId } = body;

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: "Checkout request ID is required" },
        { status: 400 },
      );
    }

    // Query M-Pesa for status
    const result = await querySTKStatus(checkoutRequestId);

    if (result.success) {
      // Update payment in database
      const { data: payment } = await supabaseAdmin
        .from("payments")
        .select("*, users(email)")
        .eq("mpesa_checkout_id", checkoutRequestId)
        .single();

      if (payment) {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", payment.id);
      }

      return NextResponse.json({
        success: true,
        status: "completed",
        message: "Payment successful",
      });
    } else {
      return NextResponse.json({
        success: false,
        status: "pending",
        message: result.resultDesc || "Payment still processing",
      });
    }
  } catch (error: any) {
    console.error("Payment check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 },
    );
  }
}
