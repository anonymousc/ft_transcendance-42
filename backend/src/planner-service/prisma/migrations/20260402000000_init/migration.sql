-- CreateTable
CREATE TABLE "TripPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "preferences" TEXT[],
    "plan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TripPlan_userId_idx" ON "TripPlan"("userId");

-- CreateIndex
CREATE INDEX "TripPlan_userId_city_idx" ON "TripPlan"("userId", "city");
