import { NextRequest, NextResponse } from "next/server";

/**
 * /api/jobdesk/acceptance — in-memory store.
 * MongoDB has been removed; data persists only for the lifetime of the
 * server process (replace with a NestJS endpoint when persistent storage
 * is needed).
 */

interface AcceptanceRecord {
  id: string;
  nama: string;
  departemen: string;
  jabatan: string;
  jobdesk: object;
  signature: string;
  acceptedAt: string;
  userId: string;
}

let acceptanceStore: AcceptanceRecord[] = [];

export async function GET(_request: NextRequest) {
  const sorted = [...acceptanceStore].sort(
    (a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime()
  );
  return NextResponse.json({ records: sorted });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, departemen, jabatan, jobdesk, signature, acceptedAt, userId } = body;

    if (!nama || !departemen || !jabatan || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const record: AcceptanceRecord = {
      id:         String(Date.now()),
      nama,
      departemen,
      jabatan,
      jobdesk:    jobdesk ?? {},
      signature,
      acceptedAt: acceptedAt ?? new Date().toISOString(),
      userId:     userId ?? "",
    };

    acceptanceStore.push(record);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error("Error saving job acceptance:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
