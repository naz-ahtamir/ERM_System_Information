import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { SubSubElementData, FindingStatus } from "@/types/subSubElement";

// In-memory storage — no DB, no next-auth dependency
let smk3DataStore: SubSubElementData[] = [];

// GET /api/smk3-data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subSubElementId      = searchParams.get("subSubElementId");
  const search               = searchParams.get("search");
  const tanggalDari          = searchParams.get("tanggalDari");
  const tanggalSampai        = searchParams.get("tanggalSampai");
  const statusFilter         = searchParams.get("status");
  const idKaryawan           = searchParams.get("idKaryawan");

  let data = smk3DataStore;

  if (subSubElementId) data = data.filter(i => i.subSubElementId === subSubElementId);
  if (tanggalDari)     data = data.filter(i => (i.data.tanggalInspeksi || i.createdAt) >= tanggalDari);
  if (tanggalSampai)   data = data.filter(i => (i.data.tanggalInspeksi || i.createdAt) <= tanggalSampai);
  if (statusFilter)    data = data.filter(i => i.findingStatus === statusFilter);
  if (idKaryawan)      data = data.filter(i =>
    i.createdById?.includes(idKaryawan) ||
    i.createdBy.toLowerCase().includes(idKaryawan.toLowerCase())
  );
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.createdBy.toLowerCase().includes(q) ||
      JSON.stringify(i.data).toLowerCase().includes(q)
    );
  }

  return NextResponse.json(data);
}

// POST /api/smk3-data
export async function POST(request: NextRequest) {
  try {
    const formData        = await request.formData();
    const subSubElementId = formData.get("subSubElementId") as string;
    const title           = formData.get("title") as string;
    const findingStatus   = (formData.get("findingStatus") as FindingStatus) || "OPEN";
    const createdBy       = formData.get("createdBy") as string || "Unknown";
    const createdById     = formData.get("createdById") as string | undefined;

    if (!subSubElementId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data: Record<string, any> = {};
    const files: any[] = [];
    const uploadDir = path.join(
      process.cwd(), "public", "uploads", "smk3",
      subSubElementId.replace(/\./g, "-")
    );
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    for (const [key, value] of formData.entries()) {
      if (["subSubElementId", "title", "findingStatus", "createdBy", "createdById"].includes(key)) continue;
      if (value instanceof File && value.size > 0) {
        if (value.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: `File ${value.name} melebihi batas 5MB` }, { status: 400 });
        }
        const ts       = Date.now();
        const fileName = `${ts}-${value.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await writeFile(path.join(uploadDir, fileName), Buffer.from(await value.arrayBuffer()));
        files.push({
          fieldName: key,
          fileName:  value.name,
          fileUrl:   `/uploads/smk3/${subSubElementId.replace(/\./g, "-")}/${fileName}`,
          fileSize:  value.size,
          uploadedAt: new Date().toISOString(),
        });
      } else if (!(value instanceof File)) {
        data[key] = value;
      }
    }

    const entry: SubSubElementData = {
      id:             String(Date.now()),
      subSubElementId,
      title,
      data,
      files,
      status:         "active",
      findingStatus,
      createdBy,
      createdById:    createdById || undefined,
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
    };

    smk3DataStore.push(entry);
    return NextResponse.json({ message: "Data berhasil disimpan", data: entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating smk3-data:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

// PATCH /api/smk3-data — approval actions
export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json() as { id: string; action: string };
    if (!id || !action) return NextResponse.json({ error: "ID dan action diperlukan" }, { status: 400 });

    const idx = smk3DataStore.findIndex(i => i.id === id);
    if (idx === -1) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    const entry = smk3DataStore[idx];

    if (action === "submit_inpg") {
      if (entry.findingStatus !== "OPEN") {
        return NextResponse.json({ error: "Data ini sudah disubmit sebelumnya" }, { status: 400 });
      }
      smk3DataStore[idx] = { ...entry, findingStatus: "INPG", updatedAt: new Date().toISOString() };
    } else if (action === "approve") {
      if (entry.findingStatus !== "INPG") {
        return NextResponse.json({ error: "Hanya temuan INPG yang bisa ditutup" }, { status: 400 });
      }
      smk3DataStore[idx] = { ...entry, findingStatus: "CLSD", updatedAt: new Date().toISOString() };
    } else if (action === "reject") {
      smk3DataStore[idx] = { ...entry, findingStatus: "INPG", updatedAt: new Date().toISOString() };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Status diperbarui", data: smk3DataStore[idx] });
  } catch (error) {
    console.error("Error PATCH smk3-data:", error);
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 });
  }
}

// PUT /api/smk3-data — update entry
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id       = formData.get("id") as string;
    const title    = formData.get("title") as string;

    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    const idx = smk3DataStore.findIndex(i => i.id === id);
    if (idx === -1) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    const existing  = smk3DataStore[idx];
    const data: Record<string, any> = {};
    const files: any[] = [...existing.files];

    const uploadDir = path.join(
      process.cwd(), "public", "uploads", "smk3",
      existing.subSubElementId.replace(/\./g, "-")
    );
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    for (const [key, value] of formData.entries()) {
      if (["id", "subSubElementId", "title"].includes(key)) continue;
      if (value instanceof File && value.size > 0) {
        if (value.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: `File ${value.name} melebihi batas 5MB` }, { status: 400 });
        }
        const ts       = Date.now();
        const fileName = `${ts}-${value.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        await writeFile(path.join(uploadDir, fileName), Buffer.from(await value.arrayBuffer()));
        const fi = files.findIndex(f => f.fieldName === key);
        if (fi !== -1) files.splice(fi, 1);
        files.push({
          fieldName:  key,
          fileName:   value.name,
          fileUrl:    `/uploads/smk3/${existing.subSubElementId.replace(/\./g, "-")}/${fileName}`,
          fileSize:   value.size,
          uploadedAt: new Date().toISOString(),
        });
      } else if (!(value instanceof File)) {
        data[key] = value;
      }
    }

    smk3DataStore[idx] = { ...existing, title: title || existing.title, data, files, updatedAt: new Date().toISOString() };
    return NextResponse.json({ message: "Data berhasil diperbarui", data: smk3DataStore[idx] });
  } catch (error) {
    console.error("Error PUT smk3-data:", error);
    return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
  }
}

// DELETE /api/smk3-data?id=...
export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    const idx = smk3DataStore.findIndex(i => i.id === id);
    if (idx === -1) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    smk3DataStore.splice(idx, 1);
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Error DELETE smk3-data:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
