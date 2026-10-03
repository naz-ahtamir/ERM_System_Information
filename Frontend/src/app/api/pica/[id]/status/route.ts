/**
 * Next.js API Route — /api/pica/[id]/status
 * Proxy ke NestJS backend
 * Admin-only: ubah status PICA secara langsung
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function forwardHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get('authorization');
  return auth ? { Authorization: auth } : {};
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.text();

    const res = await fetch(`${BACKEND}/pica/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...forwardHeaders(request),
        'Content-Type': 'application/json',
      },
      body,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA PATCH status]', err);
    return NextResponse.json({ error: 'Gagal mengubah status' }, { status: 500 });
  }
}
