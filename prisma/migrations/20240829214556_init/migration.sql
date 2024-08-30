-- CreateTable
CREATE TABLE "Measure" (
    "id" SERIAL NOT NULL,
    "customerCode" TEXT NOT NULL,
    "measureDatetime" TIMESTAMP(3) NOT NULL,
    "measureType" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "measureValue" INTEGER,
    "measureUuid" TEXT NOT NULL,
    "confirmedValue" INTEGER,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Measure_measureUuid_key" ON "Measure"("measureUuid");
