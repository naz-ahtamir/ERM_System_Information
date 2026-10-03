import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// In-memory storage — kebijakan data (no DB, no auth dependency)
interface KebijakanK3 {
  id: string;
  title: string;
  tanggalPenetapan: string;
  penandatangan: string;
  jabatan: string;
  nomorDokumen: string;
  deskripsi: string;
  fileUrl: string;
  fileName: string;
  status: "draft" | "active" | "archived";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

let kebijakanData: KebijakanK3[] = [];

// ── helper: extract caller name from Authorization header (best-effort) ────────
function callerName(request: NextRequest): string {
  // The JWT from NestJS contains the user's name in the payload.
  // We don't verify it here (NestJS already guards the real endpoints).
  // For the in-memory store we just use a placeholder.
  return "System";
}

// GET /api/kebijakan
export async function GET(_request: NextRequest) {
  return NextResponse.json(kebijakanData);
}

// POST /api/kebijakan
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file            = formData.get("file") as File;
    const title           = formData.get("title") as string;
    const tanggalPenetapan = formData.get("tanggalPenetapan") as string;
    const penandatangan   = formData.get("penandatangan") as string;
    const jabatan         = formData.get("jabatan") as string;
    const nomorDokumen    = formData.get("nomorDokumen") as string;
    const deskripsi       = formData.get("deskripsi") as string;

    if (!file || !title || !tanggalPenetapan || !penandatangan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "kebijakan");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const timestamp  = Date.now();
    const fileName   = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const bytes      = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

    const newKebijakan: KebijakanK3 = {
      id:               String(timestamp),
      title,
      tanggalPenetapan,
      penandatangan,
      jabatan,
      nomorDokumen,
      deskripsi,
      fileUrl:          `/uploads/kebijakan/${fileName}`,
      fileName:         file.name,
      status:           "active",
      createdBy:        callerName(request),
      createdAt:        new Date().toISOString(),
      updatedAt:        new Date().toISOString(),
    };

    kebijakanData.push(newKebijakan);
    return NextResponse.json({ message: "Kebijakan created successfully", data: newKebijakan }, { status: 201 });
  } catch (error) {
    console.error("Error creating kebijakan:", error);
    return NextResponse.json({ error: "Failed to create kebijakan" }, { status: 500 });
  }
}

// PUT /api/kebijakan
export async function PUT(request: NextRequest) {
  try {
    const formData        = await request.formData();
    const id              = formData.get("id") as string;
    const title           = formData.get("title") as string;
    const tanggalPenetapan = formData.get("tanggalPenetapan") as string;
    const penandatangan   = formData.get("penandatangan") as string;
    const jabatan         = formData.get("jabatan") as string;
    const nomorDokumen    = formData.get("nomorDokumen") as string;
    const deskripsi       = formData.get("deskripsi") as string;
    const file            = formData.get("file") as File | null;

    const index = kebijakanData.findIndex(k => k.id === id);
    if (index === -1) return NextResponse.json({ error: "Kebijakan not found" }, { status: 404 });

    let { fileUrl, fileName } = kebijakanData[index];

    if (file && file.size > 0) {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
      }
      const uploadDir = path.join(process.cwd(), "public", "uploads", "kebijakan");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      const timestamp   = Date.now();
      const newFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const bytes       = await file.arrayBuffer();
      await writeFile(path.join(uploadDir, newFileName), Buffer.from(bytes));
      fileUrl   = `/uploads/kebijakan/${newFileName}`;
      fileName  = file.name;
    }

    kebijakanData[index] = {
      ...kebijakanData[index],
      title, tanggalPenetapan, penandatangan, jabatan, nomorDokumen, deskripsi,
      fileUrl, fileName,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ message: "Kebijakan updated successfully", data: kebijakanData[index] });
  } catch (error) {
    console.error("Error updating kebijakan:", error);
    return NextResponse.json({ error: "Failed to update kebijakan" }, { status: 500 });
  }
}

// DELETE /api/kebijakan?id=...
export async function DELETE(request: NextRequest) {
  try {
    const id    = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const index = kebijakanData.findIndex(k => k.id === id);
    if (index === -1) return NextResponse.json({ error: "Kebijakan not found" }, { status: 404 });

    kebijakanData.splice(index, 1);
    return NextResponse.json({ message: "Kebijakan deleted successfully" });
  } catch (error) {
    console.error("Error deleting kebijakan:", error);
    return NextResponse.json({ error: "Failed to delete kebijakan" }, { status: 500 });
  }
}
