-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Owner" ("address", "city", "comment", "company", "createdAt", "id", "lat", "lng", "name", "phone", "updatedAt") SELECT "address", "city", "comment", "company", "createdAt", "id", "lat", "lng", "name", "phone", "updatedAt" FROM "Owner";
DROP TABLE "Owner";
ALTER TABLE "new_Owner" RENAME TO "Owner";
CREATE UNIQUE INDEX "Owner_phone_key" ON "Owner"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
