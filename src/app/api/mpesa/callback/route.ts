import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
} from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // M-Pesa callback data
    const {
      Body: {
        stkCallback: {
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata,
        },
      },
    } = body;

    // Find payment by checkout ID
    const { data: payment, error: findError } = await supabaseAdmin
      .from("payments")
      .select("*, users(email, phone)")
      .eq("mpesa_checkout_id", CheckoutRequestID)
      .single();

    if (findError || !payment) {
      console.error("Payment not found:", CheckoutRequestID);
      return NextResponse.json({ success: false });
    }

    if (ResultCode === 0) {
      // Payment successful
      const mpesaReceipt = CallbackMetadata?.Item?.find(
        (item: any) => item.Name === "MpesaReceiptNumber",
      )?.Value;

      // Update payment status
      await supabaseAdmin
        .from("payments")
        .update({
          status: "completed",
          mpesa_receipt: mpesaReceipt,
          completed_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // If there's a user, update their document as paid
      if (payment.user_id && payment.document_id) {
        const tableName =
          payment.document_type === "cv"
            ? "user_cvs"
            : payment.document_type === "cover_letter"
              ? "cover_letters"
              : "portfolios";

        await supabaseAdmin
          .table(tableName)
          .update({ is_paid: true })
          .eq("id", payment.document_id);
      }

      // Send confirmation email if user exists
      if (payment.users?.email) {
        await sendPaymentConfirmationEmail(
          payment.users.email,
          payment.users.email.split("@")[0],
          payment.amount,
          payment.document_type,
          mpesaReceipt || "N/A",
        );
      }
    } else {
      // Payment failed
      await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // Send failure email if user exists
      if (payment.users?.email) {
        await sendPaymentFailedEmail(
          payment.users.email,
          payment.users.email.split("@")[0],
          payment.amount,
          ResultDesc,
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
