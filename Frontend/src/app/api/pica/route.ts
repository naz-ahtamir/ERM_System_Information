/**
 * Next.js API Route — /api/pica
 * Proxy ke NestJS backend (GET, POST, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const maxDuration = 60;

function forwardHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get('authorization');
  return auth ? { Authorization: auth } : {};
}

// ── GET /api/pica ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const qs = new URL(request.url).search;
    const res = await fetch(`${BACKEND}/pica${qs}`, {
      headers: forwardHeaders(request),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA GET]', err);
    return NextResponse.json({ error: 'Gagal memuat data PICA' }, { status: 500 });
  }
}

// ── POST /api/pica — buat temuan baru ─────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const res = await fetch(`${BACKEND}/pica`, {
      method: 'POST',
      headers: forwardHeaders(request),
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA POST]', err);
    return NextResponse.json({ error: 'Gagal membuat temuan' }, { status: 500 });
  }
}

// ── PUT /api/pica — update record ─────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    const res = await fetch(`${BACKEND}/pica/${id}`, {
      method: 'PUT',
      headers: forwardHeaders(request),
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA PUT]', err);
    return NextResponse.json({ error: 'Gagal memperbarui record' }, { status: 500 });
  }
}

// ── DELETE /api/pica?id=... ───────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    const res = await fetch(`${BACKEND}/pica/${id}`, {
      method: 'DELETE',
      headers: forwardHeaders(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA DELETE]', err);
    return NextResponse.json({ error: 'Gagal menghapus record' }, { status: 500 });
  }
}
