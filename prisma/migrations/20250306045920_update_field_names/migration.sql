/*
  Warnings:

  - You are about to alter the column `rating` on the `Rating` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `taste` on the `Rating` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `value` on the `Rating` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - Added the required column `price` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "burritoTitle" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "rating" REAL NOT NULL,
    "taste" REAL NOT NULL,
    "value" REAL NOT NULL,
    "price" REAL NOT NULL,
    "hasPotatoes" BOOLEAN NOT NULL DEFAULT false,
    "hasCheese" BOOLEAN NOT NULL DEFAULT false,
    "hasBacon" BOOLEAN NOT NULL DEFAULT false,
    "hasChorizo" BOOLEAN NOT NULL DEFAULT false,
    "hasOnion" BOOLEAN NOT NULL DEFAULT false,
    "hasVegetables" BOOLEAN NOT NULL DEFAULT false,
    "review" TEXT,
    "reviewerName" TEXT,
    "identityPassword" TEXT,
    "generatedEmoji" TEXT,
    "reviewerEmoji" TEXT
);
INSERT INTO "new_Rating" ("burritoTitle", "createdAt", "hasBacon", "hasCheese", "hasChorizo", "hasOnion", "hasPotatoes", "hasVegetables", "id", "latitude", "longitude", "rating", "restaurantName", "review", "reviewerName", "taste", "updatedAt", "value") SELECT "burritoTitle", "createdAt", "hasBacon", "hasCheese", "hasChorizo", "hasOnion", "hasPotatoes", "hasVegetables", "id", "latitude", "longitude", "rating", "restaurantName", "review", "reviewerName", "taste", "updatedAt", "value" FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "new_Rating" RENAME TO "Rating";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
