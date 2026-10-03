import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/me
 *
 * Proxy ke NestJS — mendapatkan profil user yang sedang login.
 * Membaca JWT dari header Authorization dan meneruskan ke backend.
 *
 * Karena frontend sudah menyimpan data user dari payload JWT saat login,
 * route ini berguna untuk:
 *   - Refresh data user terkini dari database
 *   - Validasi token masih aktif di backend
 *
 * Response: { id, idKaryawan, nama, role, departemen, ... }
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization");

    if (!auth) {
      return NextResponse.json({ message: "Authorization header diperlukan" }, { status: 401 });
    }

    // Backend NestJS tidak punya /auth/me — kita decode JWT dan ambil dari /auth/users/:id
    // Ambil user ID dari JWT payload (bagian tengah base64)
    const token = auth.replace("Bearer ", "");
    let userId: string | null = null;

    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf-8")
      );
      userId = payload.id || payload.sub || null;
    } catch {
      return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ message: "User ID tidak ditemukan dalam token" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND}/auth/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy] GET /api/auth/me error:", err);
    return NextResponse.json(
      { message: "Backend tidak dapat dijangkau. Pastikan server NestJS berjalan di port 3001." },
      { status: 502 }
    );
  }
}
