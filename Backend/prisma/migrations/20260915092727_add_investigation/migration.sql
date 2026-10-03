-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('DRAFT', 'UNDER_INVESTIGATION', 'PENDING_APPROVAL', 'APPROVED', 'VICTIM_SIGNED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JenisKecelakaan" AS ENUM ('LUKA_RINGAN', 'LUKA_BERAT', 'MENINGGAL', 'KERUSAKAN', 'NEAR_MISS');

-- CreateTable
CREATE TABLE "investigations" (
    "id" TEXT NOT NULL,
    "tanggal_kejadian" TIMESTAMP(3) NOT NULL,
    "waktu_kejadian" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "deskripsi_kejadian" TEXT NOT NULL,
    "jenis_kecelakaan" "JenisKecelakaan" NOT NULL,
    "jumlah_korban" INTEGER NOT NULL DEFAULT 0,
    "daftar_korban" JSONB,
    "saksi" TEXT,
    "kerugian_material" TEXT,
    "foto_bukti" TEXT,
    "investigator_id" TEXT,
    "tanggal_investigasi" TIMESTAMP(3),
    "root_cause" TEXT,
    "temuan_investigasi" TEXT,
    "rekomendasi_perbaikan" TEXT,
    "lampiran_laporan" TEXT,
    "catatan_tambahan" TEXT,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "signature_approval" TEXT,
    "victim_signed_at" TIMESTAMP(3),
    "victim_signature" TEXT,
    "supervisor_signed_at" TIMESTAMP(3),
    "supervisor_signature" TEXT,
    "supervisor_note" TEXT,
    "status" "InvestigationStatus" NOT NULL DEFAULT 'DRAFT',
    "finding_id" TEXT,
    "pelapor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_logs" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_investigator_id_fkey" FOREIGN KEY ("investigator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "findings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_pelapor_id_fkey" FOREIGN KEY ("pelapor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_logs" ADD CONSTRAINT "investigation_logs_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_logs" ADD CONSTRAINT "investigation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
