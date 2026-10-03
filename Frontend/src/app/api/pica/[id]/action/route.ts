/**
 * Next.js API Route — /api/pica/[id]/action
 * Proxy ke NestJS backend
 * Actions: submit_perbaikan | approve | reject | set_in_progress
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const maxDuration = 60;

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
    const contentType = request.headers.get('content-type') || '';

    let body: BodyInit;
    let extraHeaders: HeadersInit = {};

    if (contentType.includes('multipart/form-data')) {
      // FormData — forward as-is (file upload)
      body = await request.formData();
    } else {
      // JSON
      body = await request.text();
      extraHeaders = { 'Content-Type': 'application/json' };
    }

    const res = await fetch(`${BACKEND}/pica/${id}/action`, {
      method: 'PATCH',
      headers: { ...forwardHeaders(request), ...extraHeaders },
      body,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA PATCH action]', err);
    return NextResponse.json({ error: 'Gagal memproses aksi' }, { status: 500 });
  }
}
