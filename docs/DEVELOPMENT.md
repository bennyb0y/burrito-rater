# Development Guide

This document provides information about the development environment for the Burrito Rater application.

## Overview

The Burrito Rater application uses a cloud-first architecture with Cloudflare D1 as the single source of truth for all data. This means:

1. All environments (development and production) use the same cloud database
2. No local database development is needed
3. Data is consistent across all environments
4. Changes to data are immediately visible to all users

## Environment Setup

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_API_BASE_URL=https://your-worker-name.your-account.workers.dev
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

## Development Workflow

### Frontend Development

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

The application connects directly to the Cloudflare Worker API, which uses Cloudflare D1 as the database. This ensures that all environments use the same data source.

### Data Management

Since we use Cloudflare D1 as the single source of truth:

1. All data changes are immediately visible to all users
2. No need to sync data between environments
3. Changes are persisted in the cloud database
4. Data is consistent across all deployments

## Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status:

1. Confirmations are consistent across all devices
2. Confirmations persist between browser sessions
3. Confirmations are stored in the database and available to all users

## Troubleshooting

### API Connection Issues

If you're having trouble connecting to the API:

1. Check your `.env.local` file to ensure the API URL is set correctly
2. Verify that the Cloudflare Worker is deployed and running
3. Check the browser console for CORS errors or other issues

### Database Issues

If you're experiencing database issues:

1. Check the Cloudflare D1 dashboard to ensure the database exists
2. Verify that the database ID in `wrangler.toml` matches the actual database ID
3. Check the Cloudflare Worker logs for any database connection errors 