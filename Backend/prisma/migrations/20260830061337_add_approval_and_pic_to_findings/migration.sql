-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('ACC', 'TACC');

-- AlterTable
ALTER TABLE "findings" ADD COLUMN     "approval_status" "ApprovalStatus",
ADD COLUMN     "follow_up_deadline" TIMESTAMP(3),
ADD COLUMN     "follow_up_note" TEXT,
ADD COLUMN     "pic_id" TEXT;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
