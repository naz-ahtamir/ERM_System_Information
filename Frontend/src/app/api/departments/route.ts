import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function fwdHeaders(req: NextRequest): HeadersInit {
  const auth = req.headers.get('Authorization');
  return {
    'Content-Type': 'application/json',
    ...(auth ? { Authorization: auth } : {}),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const centerId = searchParams.get('centerId');
    const qs = centerId ? `?centerId=${centerId}` : '';
    const res = await fetch(`${BACKEND}/departments${qs}`, { headers: fwdHeaders(req) });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/departments`, {
      method: 'POST',
      headers: fwdHeaders(req),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
