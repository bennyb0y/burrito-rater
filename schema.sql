CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);

-- Create Rating table
CREATE TABLE Rating (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  restaurantName TEXT NOT NULL,
  burritoTitle TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  zipcode TEXT,
  rating REAL NOT NULL,
  taste REAL NOT NULL,
  value REAL NOT NULL,
  price REAL NOT NULL,
  hasPotatoes BOOLEAN NOT NULL DEFAULT FALSE,
  hasCheese BOOLEAN NOT NULL DEFAULT FALSE,
  hasBacon BOOLEAN NOT NULL DEFAULT FALSE,
  hasChorizo BOOLEAN NOT NULL DEFAULT FALSE,
  hasOnion BOOLEAN NOT NULL DEFAULT FALSE,
  hasVegetables BOOLEAN NOT NULL DEFAULT FALSE,
  review TEXT,
  reviewerName TEXT,
  identityPassword TEXT,
  generatedEmoji TEXT,
  reviewerEmoji TEXT,
  confirmed INTEGER NOT NULL DEFAULT 0
);

-- Create index for location-based queries
CREATE INDEX idx_rating_location ON Rating (latitude, longitude);

-- Create index for zipcode-based queries
CREATE INDEX idx_rating_zipcode ON Rating (zipcode);

-- Create index for confirmation status
CREATE INDEX idx_rating_confirmed ON Rating (confirmed);

-- Create trigger to update the updatedAt timestamp
CREATE TRIGGER update_rating_timestamp
AFTER UPDATE ON Rating
FOR EACH ROW
BEGIN
  UPDATE Rating SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
