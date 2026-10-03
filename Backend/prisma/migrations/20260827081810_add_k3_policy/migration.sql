-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "k3_policies" (
    "id" TEXT NOT NULL,
    "jenis_kebijakan" TEXT NOT NULL,
    "judul_kebijakan" TEXT NOT NULL,
    "tanggal_penetapan" TIMESTAMP(3) NOT NULL,
    "penandatangan" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "status_dokumen" TEXT NOT NULL,
    "status_distribusi" TEXT,
    "status_validasi" TEXT,
    "file_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "k3_policies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "k3_policies" ADD CONSTRAINT "k3_policies_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "k3_policies" ADD CONSTRAINT "k3_policies_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
