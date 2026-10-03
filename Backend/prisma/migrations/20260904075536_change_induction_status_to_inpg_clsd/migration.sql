-- Migrate existing data
UPDATE "induction_sessions" 
SET status = 'INPG' 
WHERE status IN ('DRAFT', 'ACTIVE');

UPDATE "induction_sessions" 
SET status = 'CLSD' 
WHERE status = 'COMPLETED';

-- AlterTable (change default)
ALTER TABLE "induction_sessions" ALTER COLUMN "status" SET DEFAULT 'INPG';
