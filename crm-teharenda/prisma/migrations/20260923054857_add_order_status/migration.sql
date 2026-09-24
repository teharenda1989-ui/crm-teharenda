-- AlterTable
ALTER TABLE "MessageLog" ADD COLUMN "chatId" TEXT;
ALTER TABLE "MessageLog" ADD COLUMN "messageId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "city" TEXT,
    "when" TEXT NOT NULL,
    "description" TEXT,
    "dispatcher" TEXT NOT NULL,
    "dispatcherPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Order" ("category", "city", "createdAt", "description", "dispatcher", "dispatcherPhone", "id", "when") SELECT "category", "city", "createdAt", "description", "dispatcher", "dispatcherPhone", "id", "when" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
