import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  initiateSTKPush,
  formatPhoneNumber,
  isValidPhoneNumber,
} from "@/lib/mpesa";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, amount, documentType, userId, documentId } = body;

    // Validate phone number
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Valid M-Pesa phone number is required (e.g., 0712345678)" },
        { status: 400 },
      );
    }

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 },
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const accountReference = `CareerAI-${documentType}-${uuidv4().slice(0, 8)}`;
    const transactionDesc = `CareerAI ${documentType} payment`;

    // Initiate STK Push
    const result = await initiateSTKPush({
      phoneNumber: formattedPhone,
      amount,
      accountReference,
      transactionDesc,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to initiate payment" },
        { status: 400 },
      );
    }

    // Create payment record in database
    const { data: payment, error: dbError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId || null,
        amount,
        currency: "KES",
        status: "pending",
        mpesa_checkout_id: result.checkoutRequestId,
        document_type: documentType,
        document_id: documentId || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB insert fails - payment was initiated
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId: result.checkoutRequestId,
      paymentId: payment?.id,
      message: "STK Push sent. Please check your phone and enter your PIN.",
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 },
    );
  }
}
