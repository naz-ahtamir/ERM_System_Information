/**
 * Next.js API Route — /api/pica/[id]
 * Proxy ke NestJS backend (GET satu record, PUT update)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function forwardHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get('authorization');
  return auth ? { Authorization: auth } : {};
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND}/pica/${id}`, {
      headers: forwardHeaders(request),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA GET/:id]', err);
    return NextResponse.json({ error: 'Gagal memuat record PICA' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const res = await fetch(`${BACKEND}/pica/${id}`, {
      method: 'PUT',
      headers: forwardHeaders(request),
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA PUT/:id]', err);
    return NextResponse.json({ error: 'Gagal memperbarui record' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND}/pica/${id}`, {
      method: 'DELETE',
      headers: forwardHeaders(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA DELETE/:id]', err);
    return NextResponse.json({ error: 'Gagal menghapus record' }, { status: 500 });
  }
}
