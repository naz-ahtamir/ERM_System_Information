-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "objek_k3_id" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_objek_k3_id_fkey" FOREIGN KEY ("objek_k3_id") REFERENCES "objek_k3"("id") ON DELETE SET NULL ON UPDATE CASCADE;
