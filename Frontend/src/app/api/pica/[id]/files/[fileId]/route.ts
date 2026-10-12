/**
 * Next.js API Route — /api/pica/[id]/files/[fileId]
 * Proxy ke NestJS backend: hapus satu file attachment dari record PICA
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function forwardHeaders(request: NextRequest): HeadersInit {
  const auth = request.headers.get('authorization');
  return auth ? { Authorization: auth } : {};
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  try {
    const { id, fileId } = await params;
    const res = await fetch(`${BACKEND}/pica/${id}/files/${fileId}`, {
      method: 'DELETE',
      headers: forwardHeaders(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PICA DELETE file]', err);
    return NextResponse.json({ error: 'Gagal menghapus file' }, { status: 500 });
  }
}
