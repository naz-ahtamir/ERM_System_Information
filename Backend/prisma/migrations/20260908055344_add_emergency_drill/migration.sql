-- CreateEnum
CREATE TYPE "Perusahaan" AS ENUM ('QMB', 'ESG', 'MEIMING', 'GEN', 'QINGMEI', 'GNM');

-- CreateEnum
CREATE TYPE "KategoriObjek" AS ENUM ('PESAWAT_UAP_DAN_BEJANA_TEKAN', 'PESAWAT_ANGKAT_ANGKUT', 'PESAWAT_TENAGA_PRODUKSI', 'INSTALASI_LISTRIK', 'INSTALASI_PENYALUR_PETIR', 'INSTALASI_ELEVATOR', 'INSTALASI_PROTEKSI_KEBAKARAN');

-- CreateEnum
CREATE TYPE "StatusKelayakan" AS ENUM ('LAYAK', 'TIDAK_LAYAK', 'PERLU_PERBAIKAN');

-- CreateEnum
CREATE TYPE "StatusRiksaUji" AS ENUM ('SUDAH', 'BELUM', 'DALAM_PROSES');

-- CreateEnum
CREATE TYPE "StatusAman" AS ENUM ('AMAN', 'PROSES_RIKSA_UJI', 'PROSES_PERPANJANG', 'BELUM_ADA_PLAN');

-- CreateEnum
CREATE TYPE "DrillType" AS ENUM ('FIRE', 'EARTHQUAKE', 'CHEMICAL_SPILL', 'EVACUATION', 'FIRST_AID', 'OTHER');

-- CreateEnum
CREATE TYPE "DrillStatus" AS ENUM ('COMPLETED', 'NOT_COMPLETED');

-- CreateTable
CREATE TABLE "objek_k3" (
    "id" TEXT NOT NULL,
    "perusahaan" "Perusahaan" NOT NULL,
    "kategori" "KategoriObjek" NOT NULL,
    "nama_alat" TEXT NOT NULL,
    "no_seri" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "departemen_id" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "kapasitas" DOUBLE PRECISION,
    "satuan" TEXT,
    "tahun_pemasangan" INTEGER,
    "kondisi_pemasangan" TEXT,
    "pengesahan_gambar" TEXT,
    "tanggal_pengujian_pertama" TIMESTAMP(3),
    "tanggal_pengujian_berkala" TIMESTAMP(3),
    "status_kelayakan" "StatusKelayakan",
    "status_riksa_uji" "StatusRiksaUji",
    "no_suket" TEXT,
    "tanggal_riksa_uji_terakhir" TIMESTAMP(3),
    "tanggal_berlaku" TIMESTAMP(3),
    "sisa_hari" INTEGER,
    "status_aman" "StatusAman",
    "jadwal_riksa_uji" TIMESTAMP(3),
    "lhu" TEXT,
    "file_lhu" TEXT,
    "lhu_ada" TEXT,
    "no_lhu" TEXT,
    "foto_alat" TEXT,
    "foto_tagging" TEXT,
    "sertifikat" TEXT,
    "laporan_pemeriksaan" TEXT,
    "catatan" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objek_k3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_pemeriksaan" (
    "id" TEXT NOT NULL,
    "objek_k3_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "hasil" TEXT NOT NULL,
    "catatan" TEXT,
    "file_laporan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_pemeriksaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_drills" (
    "id" TEXT NOT NULL,
    "plan_date" TIMESTAMP(3) NOT NULL,
    "drill_type" "DrillType" NOT NULL,
    "scenario" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "pic_plan" TEXT NOT NULL,
    "notes_plan" TEXT,
    "actual_date" TIMESTAMP(3),
    "location" TEXT,
    "total_tka" INTEGER,
    "total_tki" INTEGER,
    "total_staff" INTEGER,
    "participation_rate" DOUBLE PRECISION,
    "duration" TEXT,
    "pic_actual" TEXT,
    "notes_actual" TEXT,
    "photo_documentation" TEXT,
    "attendance_list" TEXT,
    "drill_report" TEXT,
    "status" "DrillStatus" NOT NULL DEFAULT 'NOT_COMPLETED',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_drills_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "objek_k3" ADD CONSTRAINT "objek_k3_departemen_id_fkey" FOREIGN KEY ("departemen_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objek_k3" ADD CONSTRAINT "objek_k3_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objek_k3" ADD CONSTRAINT "objek_k3_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pemeriksaan" ADD CONSTRAINT "riwayat_pemeriksaan_objek_k3_id_fkey" FOREIGN KEY ("objek_k3_id") REFERENCES "objek_k3"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_drills" ADD CONSTRAINT "emergency_drills_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_drills" ADD CONSTRAINT "emergency_drills_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_drills" ADD CONSTRAINT "emergency_drills_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
