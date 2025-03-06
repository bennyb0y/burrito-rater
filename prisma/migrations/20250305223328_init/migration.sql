-- CreateTable
CREATE TABLE "BurritoRating" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "rating" REAL NOT NULL,
    "taste" REAL NOT NULL,
    "value" REAL NOT NULL,
    "tortilla" REAL NOT NULL,
    "fillings" REAL NOT NULL,
    "review" TEXT,
    "reviewerName" TEXT
);
