-- CreateTable
CREATE TABLE "RoyaltyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
