-- CreateEnum
CREATE TYPE "KategoriPica" AS ENUM ('KRITIKAL', 'MAYOR', 'MINOR');

-- CreateEnum
CREATE TYPE "JenisTemuan" AS ENUM ('Kondisi Tidak Aman', 'Tindakan Tidak Aman', 'Hampir Celaka', 'Ketidaksesuaian');

-- CreateEnum
CREATE TYPE "StatusPerbaikanPica" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLSD');

-- CreateEnum
CREATE TYPE "ApprovalActionPica" AS ENUM ('ACC', 'TACC');

-- CreateTable
CREATE TABLE "pica" (
    "id" TEXT NOT NULL,
    "temuan_masalah" TEXT NOT NULL,
    "kriteria_id" TEXT NOT NULL,
    "kriteria_deskripsi" TEXT,
    "kategori" "KategoriPica" NOT NULL DEFAULT 'MINOR',
    "lokasi_divisi_id" TEXT NOT NULL,
    "lokasi_divisi_nama" TEXT,
    "dokumentasi_temuan_teks" TEXT,
    "tanggal_temuan" TIMESTAMP(3) NOT NULL,
    "jenis_temuan" "JenisTemuan" NOT NULL DEFAULT 'Kondisi Tidak Aman',
    "hirarki_pengendalian" TEXT[],
    "rekomendasi_perbaikan" TEXT NOT NULL,
    "pic_id" TEXT NOT NULL,
    "pic_nama" TEXT NOT NULL,
    "divisi_id" TEXT NOT NULL,
    "batas_akhir" TIMESTAMP(3) NOT NULL,
    "status_perbaikan" "StatusPerbaikanPica" NOT NULL DEFAULT 'OPEN',
    "tanggal_perbaikan" TIMESTAMP(3),
    "catatan_tacc" TEXT,
    "created_by" TEXT NOT NULL,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pica_files" (
    "id" TEXT NOT NULL,
    "pica_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pica_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pica_approvals" (
    "id" TEXT NOT NULL,
    "pica_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "oleh" TEXT NOT NULL,
    "action" "ApprovalActionPica" NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "pica_approvals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pica_files" ADD CONSTRAINT "pica_files_pica_id_fkey" FOREIGN KEY ("pica_id") REFERENCES "pica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pica_approvals" ADD CONSTRAINT "pica_approvals_pica_id_fkey" FOREIGN KEY ("pica_id") REFERENCES "pica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
