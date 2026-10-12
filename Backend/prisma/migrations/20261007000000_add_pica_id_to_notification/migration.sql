-- Add pica_id column to notifications table for PICA notification navigation
ALTER TABLE "notifications" ADD COLUMN "pica_id" TEXT;

-- Add foreign key constraint referencing pica table
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_pica_id_fkey"
  FOREIGN KEY ("pica_id") REFERENCES "pica"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
