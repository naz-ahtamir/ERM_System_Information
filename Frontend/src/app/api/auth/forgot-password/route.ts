import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/forgot-password
 *
 * Proxy ke NestJS — request reset password token.
 *
 * Body: { idKaryawan: string }
 * Response: { message: string, resetToken?: string }
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy] POST /api/auth/forgot-password error:", err);
    return NextResponse.json(
      { message: "Backend tidak dapat dijangkau." },
      { status: 502 }
    );
  }
}
