import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth.config";

/**
 * GET /api/auth/token
 *
 * Return NestJS accessToken dari NextAuth session.
 * Dipakai oleh NotificationContext sebagai fallback ketika token di
 * localStorage tidak valid / expired.
 *
 * Response: { token: string } atau 401 jika tidak ada session.
 */
export async function GET() {
  const session = await getServerSession(authOptions) as any;

  if (!session?.accessToken) {
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }

  return NextResponse.json({ token: session.accessToken });
}
