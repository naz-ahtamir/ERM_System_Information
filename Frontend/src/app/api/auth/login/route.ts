import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 *
 * Thin proxy ke NestJS backend POST /api/auth/login.
 * AuthContext.login() bisa langsung call endpoint ini ATAU
 * memanggil backend langsung via NEXT_PUBLIC_API_URL — keduanya valid.
 *
 * Kelebihan via proxy ini:
 *   - Sembunyikan backend URL dari browser di production
 *   - Bisa tambahkan rate-limit / logging di sini
 *
 * Body: { idKaryawan: string, password: string }
 * Response: { user: {...}, token: string }
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.idKaryawan || !body.password) {
      return NextResponse.json(
        { message: "idKaryawan dan password wajib diisi" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idKaryawan: String(body.idKaryawan).trim(),
        password: body.password,
      }),
    });

    const data = await res.json();

    // Forward status code dari backend (200 = OK, 401 = wrong credentials)
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy] POST /api/auth/login error:", err);
    return NextResponse.json(
      { message: "Backend tidak dapat dijangkau. Pastikan server NestJS berjalan di port 3001." },
      { status: 502 }
    );
  }
}
