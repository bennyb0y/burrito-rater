# Deployment Guide

This document outlines the deployment process for the Burrito Rater application.

## Architecture

The Burrito Rater application consists of two main components:

1. **Frontend**: A Next.js application deployed to Cloudflare Pages
2. **Backend API**: A Cloudflare Worker with D1 database integration

## Deployment Process

### Frontend Deployment

To deploy the frontend to Cloudflare Pages:

1. Build the application:
   ```bash
   npm run pages:build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   npm run pages:deploy
   ```

### Backend Deployment

To deploy the backend API to Cloudflare Workers:

1. Deploy the worker:
   ```bash
   npm run deploy:worker
   ```

## Environment Variables

The following environment variables need to be set in Cloudflare Pages:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key for map functionality
- `NEXT_PUBLIC_API_BASE_URL`: URL of the Cloudflare Worker API (e.g., `https://your-worker-name.your-account.workers.dev`)
- `NEXT_PUBLIC_ADMIN_PASSWORD`: Password for the admin interface

### Development Environment Variables

For local development, you can set additional environment variables in your `.env.local` file:

- `NEXT_PUBLIC_DEV_API_BASE_URL`: URL for the development API server (e.g., `http://localhost:8787`)

## API Configuration

The application is configured to use different API endpoints based on the environment:

- **Production**: Uses the `NEXT_PUBLIC_API_BASE_URL` environment variable
- **Development**: Can be configured to use a separate development API by setting `NEXT_PUBLIC_DEV_API_BASE_URL`

This separation allows you to:
1. Keep development and production data separate
2. Test changes to the API without affecting production data
3. Use a local API server for development if needed

## Current Implementation Notes

### Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status:

1. When an admin confirms a rating in the admin interface, the confirmation status is stored in the D1 database.
2. The Map and List views filter ratings based on the confirmation status from the database.
3. This ensures that confirmations are consistent across all devices and environments.

### Known Limitations

1. **API Integration**: The backend API handles confirmations through the Cloudflare D1 database. The database schema has been updated to include a `confirmed` column.

## Future Improvements

1. **Deployment Automation**: Set up GitHub Actions for automated deployments.

2. **User Authentication**: Implement proper user authentication for the admin interface.

## Troubleshooting

### API Errors

If you encounter API errors, check the following:

1. Ensure the Cloudflare Worker is deployed correctly.
2. Verify that the `NEXT_PUBLIC_API_BASE_URL` environment variable is set correctly.
3. Check the browser console for specific error messages.

### Deployment Errors

If you encounter deployment errors:

1. Ensure you have the correct Cloudflare credentials set up.
2. Check that the wrangler.toml file is configured correctly.
3. Verify that the build process completes successfully before deploying. 