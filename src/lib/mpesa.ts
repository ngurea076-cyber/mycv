import axios from "axios";

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const MPESA_BASE_URL =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE!;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Generate access token
async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (accessToken && now < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  try {
    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    accessToken = response.data.access_token;
    // Set expiry 1 hour from now
    tokenExpiry = now + 55 * 60 * 1000;

    return accessToken!;
  } catch (error) {
    console.error("Failed to get M-Pesa access token:", error);
    throw new Error("Failed to authenticate with M-Pesa");
  }
}

// Generate password for STK Push
function generatePassword(): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");
  const password = Buffer.from(
    `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`,
  ).toString("base64");
  return password;
}

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  success: boolean;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  error?: string;
}

// Initiate STK Push
export async function initiateSTKPush(
  request: STKPushRequest,
): Promise<STKPushResponse> {
  try {
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[-T:]/g, "");
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`,
    ).toString("base64");

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: request.amount,
      PartyA: request.phoneNumber,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: request.phoneNumber,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

    if (data.ResponseCode === "0") {
      return {
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage,
      };
    } else {
      return {
        success: false,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage,
      };
    }
  } catch (error: any) {
    console.error("STK Push error:", error.response?.data || error.message);
    return {
      success: false,
      error:
        error.response?.data?.errorMessage ||
        error.message ||
        "Failed to initiate payment",
    };
  }
}

// Query STK Push status
export async function querySTKStatus(checkoutRequestId: string): Promise<{
  success: boolean;
  status?: string;
  resultCode?: string;
  resultDesc?: string;
}> {
  try {
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[-T:]/g, "");
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`,
    ).toString("base64");

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

    return {
      success: data.ResponseCode === "0",
      status: data.ResponseCode === "0" ? "success" : "failed",
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc,
    };
  } catch (error: any) {
    console.error("STK Query error:", error.response?.data || error.message);
    return {
      success: false,
      status: "error",
      resultDesc: error.message || "Failed to query payment status",
    };
  }
}

// Format phone number to required format
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 0, replace with 254
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }

  // If doesn't start with 254, add it
  if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }

  return cleaned;
}

// Validate phone number
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^254[7][0-9]{8}$/.test(formatted);
}
