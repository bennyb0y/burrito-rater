/*
  Warnings:

  - You are about to drop the `BurritoRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BurritoRating";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Rating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "burritoTitle" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "taste" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "hasPotatoes" BOOLEAN NOT NULL DEFAULT false,
    "hasCheese" BOOLEAN NOT NULL DEFAULT false,
    "hasBacon" BOOLEAN NOT NULL DEFAULT false,
    "hasChorizo" BOOLEAN NOT NULL DEFAULT false,
    "hasOnion" BOOLEAN NOT NULL DEFAULT false,
    "hasVegetables" BOOLEAN NOT NULL DEFAULT false,
    "review" TEXT,
    "reviewerName" TEXT
);
