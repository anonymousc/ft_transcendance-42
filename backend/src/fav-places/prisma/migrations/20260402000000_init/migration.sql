-- CreateTable
CREATE TABLE "SavedPlace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "placeName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "image" TEXT,
    "rating" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'favorited',
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedPlace_userId_idx" ON "SavedPlace"("userId");

-- CreateIndex
CREATE INDEX "SavedPlace_userId_status_idx" ON "SavedPlace"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPlace_userId_placeName_city_key" ON "SavedPlace"("userId", "placeName", "city");
