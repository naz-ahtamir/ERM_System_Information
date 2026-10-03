import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function forwardHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get("Authorization");
  return {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: auth } : {}),
  };
}

// POST /api/auth/me/change-password
// Backend reads user ID from JWT — no URL param needed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/auth/me/change-password`, {
      method: "POST",
      headers: forwardHeaders(request),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
