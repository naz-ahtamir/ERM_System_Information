import { NextRequest, NextResponse } from 'next/server';

/**
 * /api/divisions — thin proxy ke NestJS backend GET /api/divisions
 * Dipakai oleh PICA form untuk dropdown Lokasi Divisi + auto-fill PIC.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function forwardHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get('Authorization');
  return {
    'Content-Type': 'application/json',
    ...(auth ? { Authorization: auth } : {}),
  };
}

// GET /api/divisions?departmentId=...  (departmentId opsional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const qs = departmentId ? `?departmentId=${departmentId}` : '';

    const res = await fetch(`${BACKEND}/divisions${qs}`, {
      headers: forwardHeaders(request),
    });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch (err) {
    console.error('GET /api/divisions proxy error:', err);
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
