-- Add status column (favorited / visited) with a safe default so existing rows are unaffected
ALTER TABLE "SavedPlace" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'favorited';

-- Index for efficient per-user status filtering
CREATE INDEX IF NOT EXISTS "SavedPlace_userId_status_idx" ON "SavedPlace"("userId", "status");
