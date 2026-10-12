import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function fwdHeaders(req: NextRequest): HeadersInit {
  const auth = req.headers.get('Authorization');
  return {
    'Content-Type': 'application/json',
    ...(auth ? { Authorization: auth } : {}),
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${BACKEND}/divisions/${params.id}`, { headers: fwdHeaders(_req) });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/divisions/${params.id}`, {
      method: 'PUT',
      headers: fwdHeaders(req),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${BACKEND}/divisions/${params.id}`, {
      method: 'DELETE',
      headers: fwdHeaders(req),
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
