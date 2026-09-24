-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "royaltyPercent" REAL NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoyaltyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "partnerId" TEXT,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "salaries" INTEGER NOT NULL DEFAULT 0,
    "officeRent" INTEGER NOT NULL DEFAULT 0,
    "communications" INTEGER NOT NULL DEFAULT 0,
    "otherExpenses" INTEGER NOT NULL DEFAULT 0,
    "otherNote" TEXT,
    "totalExpenses" INTEGER NOT NULL DEFAULT 0,
    "netProfit" INTEGER NOT NULL DEFAULT 0,
    "royaltyPercent" REAL NOT NULL DEFAULT 0,
    "royaltyAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoyaltyReport_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RoyaltyReport" ("communications", "createdAt", "id", "netProfit", "officeRent", "otherExpenses", "otherNote", "periodEnd", "periodStart", "revenue", "royaltyAmount", "royaltyPercent", "salaries", "taxAmount", "taxRate", "totalExpenses") SELECT "communications", "createdAt", "id", "netProfit", "officeRent", "otherExpenses", "otherNote", "periodEnd", "periodStart", "revenue", "royaltyAmount", "royaltyPercent", "salaries", "taxAmount", "taxRate", "totalExpenses" FROM "RoyaltyReport";
DROP TABLE "RoyaltyReport";
ALTER TABLE "new_RoyaltyReport" RENAME TO "RoyaltyReport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");
