-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "city" TEXT,
    "startAt" DATETIME,
    "when" TEXT,
    "description" TEXT,
    "dispatcher" TEXT NOT NULL,
    "dispatcherPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "result" TEXT,
    "closedInTelegram" BOOLEAN NOT NULL DEFAULT false,
    "closedInTelegramAt" DATETIME,
    "assigneeName" TEXT,
    "assigneePhone" TEXT,
    "orderAmount" INTEGER,
    "commissionAmount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "partnerId" TEXT,
    CONSTRAINT "Order_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("category", "city", "closedAt", "commissionAmount", "createdAt", "description", "dispatcher", "dispatcherPhone", "id", "orderAmount", "partnerId", "result", "status", "when") SELECT "category", "city", "closedAt", "commissionAmount", "createdAt", "description", "dispatcher", "dispatcherPhone", "id", "orderAmount", "partnerId", "result", "status", "when" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
