import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/reset-password?token=...  → validasi token
 * POST /api/auth/reset-password           → reset password dengan token
 *
 * Proxy ke NestJS backend.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// GET — validate reset token
export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token diperlukan" }, { status: 400 });
    }

    const res = await fetch(
      `${BACKEND}/auth/reset-password/${encodeURIComponent(token)}/validate`,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy] GET /api/auth/reset-password error:", err);
    return NextResponse.json({ message: "Backend tidak dapat dijangkau." }, { status: 502 });
  }
}

// POST — reset password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy] POST /api/auth/reset-password error:", err);
    return NextResponse.json({ message: "Backend tidak dapat dijangkau." }, { status: 502 });
  }
}
