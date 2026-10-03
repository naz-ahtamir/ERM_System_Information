-- CreateEnum
CREATE TYPE "JenisDokumen" AS ENUM ('MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR');

-- CreateEnum
CREATE TYPE "StatusDokumen" AS ENUM ('ASLI', 'SALINAN', 'ASLI-REVISI', 'SALINAN-REVISI');

-- CreateEnum
CREATE TYPE "StatusDistribusi" AS ENUM ('TERKENDALI', 'TIDAK_TERKENDALI');

-- CreateEnum
CREATE TYPE "StatusValidasi" AS ENUM ('BERLAKU', 'TIDAK_BERLAKU', 'PEMUSNAHAN');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "departemen_id" TEXT NOT NULL,
    "jenis_dokumen" "JenisDokumen" NOT NULL,
    "nama_dokumen" TEXT NOT NULL,
    "nomor_dokumen" TEXT NOT NULL,
    "revisi" TEXT DEFAULT '00',
    "tanggal_terbit" TIMESTAMP(3) NOT NULL,
    "status_dokumen" "StatusDokumen" NOT NULL,
    "status_distribusi" "StatusDistribusi" NOT NULL,
    "status_validasi" "StatusValidasi" NOT NULL,
    "parent_id" TEXT,
    "file_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_departemen_id_fkey" FOREIGN KEY ("departemen_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
