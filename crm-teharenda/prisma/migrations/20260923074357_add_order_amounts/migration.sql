-- AlterTable
ALTER TABLE "Order" ADD COLUMN "closedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "commissionAmount" INTEGER;
ALTER TABLE "Order" ADD COLUMN "orderAmount" INTEGER;
ALTER TABLE "Order" ADD COLUMN "result" TEXT;
