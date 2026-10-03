import { NextRequest, NextResponse } from "next/server";

/**
 * /api/users — thin proxy ke NestJS backend.
 * Semua user data ada di PostgreSQL via NestJS.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function forwardHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get("Authorization");
  return {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: auth } : {}),
  };
}

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/auth/users`, {
      headers: forwardHeaders(request),
    });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch (err) {
    console.error("GET /api/users proxy error:", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

// POST /api/users — create single user (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/auth/bulk-create-users`, {
      method: "POST",
      headers: forwardHeaders(request),
      body: JSON.stringify({ users: [body] }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("POST /api/users proxy error:", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

// PUT /api/users — update role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND}/auth/users/${userId}/role`, {
      method: "PATCH",
      headers: forwardHeaders(request),
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("PUT /api/users proxy error:", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
