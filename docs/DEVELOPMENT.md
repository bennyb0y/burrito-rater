# Development Guide

This document provides information about the development environment for the Burrito Rater application.

## Overview

The Burrito Rater application is designed to support separate development and production environments. This separation allows you to:

1. Keep development and production data separate
2. Test changes to the API without affecting production data
3. Use a local API server for development if needed

## Environment Setup

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_API_BASE_URL=https://your-worker-name.your-account.workers.dev
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

For development with a separate API server, you can also add:

```
NEXT_PUBLIC_DEV_API_BASE_URL=http://localhost:8787
```

### API Configuration

The application is configured to use different API endpoints based on the environment:

- **Production**: Uses the `NEXT_PUBLIC_API_BASE_URL` environment variable
- **Development**: Can be configured to use a separate development API by setting `NEXT_PUBLIC_DEV_API_BASE_URL`

## Development Workflow

### Frontend Development

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Development

To run a local API server for development:

1. Start the Cloudflare Worker locally:
   ```bash
   npx wrangler dev worker.js --config wrangler.worker.toml
   ```

2. This will start a local API server at http://localhost:8787 that you can use for development.

3. Make sure your `.env.local` file includes:
   ```
   NEXT_PUBLIC_DEV_API_BASE_URL=http://localhost:8787
   ```

### Data Separation

When using a local API server, your development data is completely separate from the production data. This allows you to:

1. Test new features without affecting production data
2. Reset or modify development data without impacting production
3. Use different database schemas or configurations for development

## Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status in both development and production environments:

### Development Environment

In the development environment, confirmations are stored in the D1 database. This means:

1. Confirmations are consistent across all devices
2. Confirmations persist between browser sessions
3. Confirmations are stored in the database and available to all users

### Production Environment

In the production environment, confirmations are stored in the Cloudflare D1 database. This means:

1. Confirmations are visible to all users
2. Confirmations persist across all devices
3. Confirmations are stored in the database and available to all users

## Troubleshooting

### API Connection Issues

If you're having trouble connecting to the API:

1. Check your `.env.local` file to ensure the API URLs are set correctly
2. Verify that the API server is running (if using a local API server)
3. Check the browser console for CORS errors or other issues

### Database Issues

If you're experiencing database issues:

1. Check the Cloudflare D1 dashboard to ensure the database exists
2. Verify that the database ID in `wrangler.toml` matches the actual database ID
3. Check the Cloudflare Worker logs for any database connection errors 