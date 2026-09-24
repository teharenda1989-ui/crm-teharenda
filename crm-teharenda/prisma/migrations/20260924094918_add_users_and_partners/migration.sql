-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "partnerId" TEXT,
    CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "company" TEXT,
    "inn" TEXT,
    "kpp" TEXT,
    "ogrn" TEXT,
    "address" TEXT,
    "comment" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankBik" TEXT,
    "bankCorrAccount" TEXT,
    "partnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("address", "bankAccount", "bankBik", "bankCorrAccount", "bankName", "comment", "company", "createdAt", "email", "id", "inn", "kpp", "name", "ogrn", "phone") SELECT "address", "bankAccount", "bankBik", "bankCorrAccount", "bankName", "comment", "company", "createdAt", "email", "id", "inn", "kpp", "name", "ogrn", "phone" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "city" TEXT,
    "when" TEXT NOT NULL,
    "description" TEXT,
    "dispatcher" TEXT NOT NULL,
    "dispatcherPhone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "result" TEXT,
    "orderAmount" INTEGER,
    "commissionAmount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "partnerId" TEXT,
    CONSTRAINT "Order_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("category", "city", "closedAt", "commissionAmount", "createdAt", "description", "dispatcher", "dispatcherPhone", "id", "orderAmount", "result", "status", "when") SELECT "category", "city", "closedAt", "commissionAmount", "createdAt", "description", "dispatcher", "dispatcherPhone", "id", "orderAmount", "result", "status", "when" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Owner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "city" TEXT,
    "address" TEXT,
    "lat" REAL,
    "lng" REAL,
    "comment" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "partnerId" TEXT,
    CONSTRAINT "Owner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Owner" ("address", "city", "comment", "company", "createdAt", "id", "isActive", "lat", "lng", "name", "notes", "phone", "updatedAt") SELECT "address", "city", "comment", "company", "createdAt", "id", "isActive", "lat", "lng", "name", "notes", "phone", "updatedAt" FROM "Owner";
DROP TABLE "Owner";
ALTER TABLE "new_Owner" RENAME TO "Owner";
CREATE UNIQUE INDEX "Owner_partnerId_phone_key" ON "Owner"("partnerId", "phone");
CREATE TABLE "new_TelegramGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnerId" TEXT,
    CONSTRAINT "TelegramGroup_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TelegramGroup" ("category", "chatId", "createdAt", "id", "isActive", "title") SELECT "category", "chatId", "createdAt", "id", "isActive", "title" FROM "TelegramGroup";
DROP TABLE "TelegramGroup";
ALTER TABLE "new_TelegramGroup" RENAME TO "TelegramGroup";
CREATE UNIQUE INDEX "TelegramGroup_chatId_key" ON "TelegramGroup"("chatId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
