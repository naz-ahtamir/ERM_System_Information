import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth.config";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// In-memory storage (replace with database in production)
interface KonsultasiK3 {
  id: string;
  judulKonsultasi: string;
  tanggalKonsultasi: string;
  lokasi: string;
  peserta: string;
  topikBahasan: string;
  hasilKonsultasi: string;
  fotoKegiatanUrl: string[];
  daftarHadirUrl: string;
  notulenUrl: string;
  status: "draft" | "submitted" | "approved";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

let konsultasiData: KonsultasiK3[] = [];

// Helper function to save file
async function saveFile(file: File, subfolder: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "konsultasi", subfolder);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  return `/uploads/konsultasi/${subfolder}/${fileName}`;
}

// GET - Fetch all konsultasi (all users can read)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Users can see all data, but only admins can see draft status
  const isAdmin = session.user.role === "admin";
  const filteredData = isAdmin 
    ? konsultasiData 
    : konsultasiData.filter(k => k.status !== "draft" || k.createdBy === session.user.name);

  return NextResponse.json(filteredData);
}

// POST - Create new konsultasi (all authenticated users)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    
    const judulKonsultasi = formData.get("judulKonsultasi") as string;
    const tanggalKonsultasi = formData.get("tanggalKonsultasi") as string;
    const lokasi = formData.get("lokasi") as string;
    const peserta = formData.get("peserta") as string;
    const topikBahasan = formData.get("topikBahasan") as string;
    const hasilKonsultasi = formData.get("hasilKonsultasi") as string;

    if (!judulKonsultasi || !tanggalKonsultasi || !lokasi || !peserta) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle multiple foto kegiatan (max 5 files, 2MB each)
    const fotoKegiatanUrls: string[] = [];
    const fotoFiles = formData.getAll("fotoKegiatan") as File[];
    
    for (const file of fotoFiles) {
      if (file && file.size > 0) {
        // Validate file type (images and PDF)
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: "Foto kegiatan harus berupa JPG, PNG, atau PDF" },
            { status: 400 }
          );
        }

        const fileUrl = await saveFile(file, "foto");
        fotoKegiatanUrls.push(fileUrl);
      }
    }

    // Handle daftar hadir (PDF only, max 2MB)
    let daftarHadirUrl = "";
    const daftarHadirFile = formData.get("daftarHadir") as File;
    if (daftarHadirFile && daftarHadirFile.size > 0) {
      if (daftarHadirFile.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Daftar hadir harus berupa PDF" },
          { status: 400 }
        );
      }
      daftarHadirUrl = await saveFile(daftarHadirFile, "daftar-hadir");
    }

    // Handle notulen (PDF only, max 3MB)
    let notulenUrl = "";
    const notulenFile = formData.get("notulen") as File;
    if (notulenFile && notulenFile.size > 0) {
      if (notulenFile.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Notulen harus berupa PDF" },
          { status: 400 }
        );
      }
      notulenUrl = await saveFile(notulenFile, "notulen");
    }

    const newKonsultasi: KonsultasiK3 = {
      id: String(Date.now()),
      judulKonsultasi,
      tanggalKonsultasi,
      lokasi,
      peserta,
      topikBahasan,
      hasilKonsultasi,
      fotoKegiatanUrl: fotoKegiatanUrls,
      daftarHadirUrl,
      notulenUrl,
      status: "submitted",
      createdBy: session.user.name || "Unknown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    konsultasiData.push(newKonsultasi);

    return NextResponse.json(
      { message: "Konsultasi created successfully", data: newKonsultasi },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating konsultasi:", error);
    return NextResponse.json(
      { error: "Failed to create konsultasi" },
      { status: 500 }
    );
  }
}

// PUT - Update konsultasi (admin only)
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    const index = konsultasiData.findIndex((k) => k.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Konsultasi not found" }, { status: 404 });
    }

    const judulKonsultasi = formData.get("judulKonsultasi") as string;
    const tanggalKonsultasi = formData.get("tanggalKonsultasi") as string;
    const lokasi = formData.get("lokasi") as string;
    const peserta = formData.get("peserta") as string;
    const topikBahasan = formData.get("topikBahasan") as string;
    const hasilKonsultasi = formData.get("hasilKonsultasi") as string;

    let fotoKegiatanUrls = konsultasiData[index].fotoKegiatanUrl;
    let daftarHadirUrl = konsultasiData[index].daftarHadirUrl;
    let notulenUrl = konsultasiData[index].notulenUrl;

    // Handle new foto kegiatan
    const fotoFiles = formData.getAll("fotoKegiatan") as File[];
    if (fotoFiles.length > 0 && fotoFiles[0].size > 0) {
      fotoKegiatanUrls = [];
      for (const file of fotoFiles) {
        if (file && file.size > 0) {
          const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
              { error: "Foto kegiatan harus berupa JPG, PNG, atau PDF" },
              { status: 400 }
            );
          }
          const fileUrl = await saveFile(file, "foto");
          fotoKegiatanUrls.push(fileUrl);
        }
      }
    }

    // Handle new daftar hadir
    const daftarHadirFile = formData.get("daftarHadir") as File;
    if (daftarHadirFile && daftarHadirFile.size > 0) {
      if (daftarHadirFile.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Daftar hadir harus berupa PDF" },
          { status: 400 }
        );
      }
      daftarHadirUrl = await saveFile(daftarHadirFile, "daftar-hadir");
    }

    // Handle new notulen
    const notulenFile = formData.get("notulen") as File;
    if (notulenFile && notulenFile.size > 0) {
      if (notulenFile.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Notulen harus berupa PDF" },
          { status: 400 }
        );
      }
      notulenUrl = await saveFile(notulenFile, "notulen");
    }

    konsultasiData[index] = {
      ...konsultasiData[index],
      judulKonsultasi,
      tanggalKonsultasi,
      lokasi,
      peserta,
      topikBahasan,
      hasilKonsultasi,
      fotoKegiatanUrl: fotoKegiatanUrls,
      daftarHadirUrl,
      notulenUrl,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      message: "Konsultasi updated successfully",
      data: konsultasiData[index],
    });
  } catch (error) {
    console.error("Error updating konsultasi:", error);
    return NextResponse.json(
      { error: "Failed to update konsultasi" },
      { status: 500 }
    );
  }
}

// DELETE - Delete konsultasi (admin only)
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const index = konsultasiData.findIndex((k) => k.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Konsultasi not found" }, { status: 404 });
    }

    konsultasiData.splice(index, 1);

    return NextResponse.json({ message: "Konsultasi deleted successfully" });
  } catch (error) {
    console.error("Error deleting konsultasi:", error);
    return NextResponse.json(
      { error: "Failed to delete konsultasi" },
      { status: 500 }
    );
  }
}
