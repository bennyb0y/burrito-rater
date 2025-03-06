# Cloudflare Migration Guide

> **Note**: This document is for historical reference. The migration has been completed, and all migration scripts and Next.js API routes have been removed from the codebase. The application now uses Cloudflare Workers exclusively for its API and Cloudflare D1 as the single source of truth for data.

This document outlines the migration of the Burrito Rater application from SQLite with Prisma to Cloudflare D1 and Workers.

## Architecture Overview

### Before Migration
- **Database**: SQLite with Prisma
- **API**: Next.js API Routes
- **Frontend**: Next.js

### After Migration
- **Database**: Cloudflare D1 (single source of truth)
- **API**: Cloudflare Workers
- **Frontend**: Next.js (deployed to Cloudflare Pages)

## Benefits of Migration

1. **Serverless Architecture**
   - No need to manage database servers
   - Automatic scaling based on demand
   - Global distribution for low-latency access

2. **Simplified Deployment**
   - Database and API deployed together
   - Frontend can be deployed separately
   - No need to manage database connections

3. **Cost Efficiency**
   - Pay-as-you-go pricing model
   - Free tier for low-traffic applications
   - No need to pay for idle resources

4. **Single Source of Truth**
   - All environments use the same cloud database
   - No need for local database development
   - Consistent data across all environments

## API Endpoints

The Cloudflare Worker API is hosted at: `https://your-worker-name.your-account.workers.dev`

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ratings` | GET | Get all ratings |
| `/api/ratings` | POST | Create a new rating |
| `/api/ratings/{id}` | DELETE | Delete a rating by ID |

## Development Workflow

### Frontend Development

For frontend development, you only need to run the Next.js development server:

```bash
npm run dev
```

This will start the Next.js app on http://localhost:3000, which connects to the Cloudflare Worker API hosted in the cloud.

### API Development

When making changes to the API, you should:

1. Edit the `worker.js` file
2. Deploy the changes to Cloudflare:
   ```bash
   npm run deploy:worker
   ```

> **Note**: Local development with a local D1 database is no longer supported. All development should use the cloud D1 database as the single source of truth.

### Deploying Changes

To deploy changes to the Cloudflare Worker:

```bash
npm run deploy:worker
```

## Database Schema

The D1 database schema is defined in `schema.sql`:

```sql
CREATE TABLE Rating (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  restaurantName TEXT NOT NULL,
  burritoTitle TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  zipcode TEXT,
  rating REAL NOT NULL,
  taste REAL NOT NULL,
  value REAL NOT NULL,
  price REAL NOT NULL,
  hasPotatoes BOOLEAN NOT NULL DEFAULT 0,
  hasCheese BOOLEAN NOT NULL DEFAULT 0,
  hasBacon BOOLEAN NOT NULL DEFAULT 0,
  hasChorizo BOOLEAN NOT NULL DEFAULT 0,
  hasOnion BOOLEAN NOT NULL DEFAULT 0,
  hasVegetables BOOLEAN NOT NULL DEFAULT 0,
  review TEXT,
  reviewerName TEXT,
  identityPassword TEXT,
  generatedEmoji TEXT,
  reviewerEmoji TEXT
);
```

## Cloudflare Configuration

### Worker Configuration

The Cloudflare Worker configuration is defined in `wrangler.toml`:

```toml
name = "burrito-rater"
compatibility_date = "2023-09-01"
main = "worker.js"

[[d1_databases]]
binding = "DB"
database_name = "your-database-name"
database_id = "0e87da0b-9043-44f4-8782-3ee0c9fd6553"
```

### Pages Configuration

For Cloudflare Pages deployment, a separate configuration is used:

```toml
name = "burrito-rater"
compatibility_date = "2023-09-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "your-database-name"
database_id = "0e87da0b-9043-44f4-8782-3ee0c9fd6553"
```

> **Note**: The `nodejs_compat` compatibility flag is required for Next.js applications built with @cloudflare/next-on-pages. See [Cloudflare Pages Deployment Guide](./CLOUDFLARE_PAGES.md) for more details.

## Troubleshooting

### API Connection Issues

If you're having trouble connecting to the API:

1. Check your `.env.local` file to ensure `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. Verify that the Cloudflare Worker is deployed and running
3. Check the browser console for CORS errors

### Database Issues

If you're experiencing database issues:

1. Check the Cloudflare D1 dashboard to ensure the database exists
2. Verify that the database ID in `wrangler.toml` matches the actual database ID
3. Check the Cloudflare Worker logs for any database connection errors

## Reverting to SQLite (If Needed)

If you need to revert to SQLite for any reason:

1. Restore the Prisma schema and migrations from Git
2. Update the API routes to use Prisma instead of D1
3. Update the `.env.local` file to remove the `NEXT_PUBLIC_API_BASE_URL` variable 