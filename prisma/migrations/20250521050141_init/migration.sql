-- CreateEnum
CREATE TYPE "DisasterType" AS ENUM ('flood', 'earthquake', 'wildfire');

-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('Low', 'Medium', 'High');

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertSetting" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "disasterType" "DisasterType" NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "AlertSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "disasterType" "DisasterType" NOT NULL,
    "level" "AlertLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AlertSetting" ADD CONSTRAINT "AlertSetting_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
