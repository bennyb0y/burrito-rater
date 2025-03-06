# Cloudflare Pages Deployment Guide

This document outlines the deployment of the Burrito Rater frontend to Cloudflare Pages using next-on-pages.

## Overview

Burrito Rater uses Cloudflare Pages to host the frontend application. The deployment is automated through GitHub Actions, which builds and deploys the application whenever changes are pushed to the main branch.

## Architecture

- **Frontend**: Next.js application deployed to Cloudflare Pages
- **API**: Cloudflare Worker
- **Database**: Cloudflare D1 (single source of truth)

## Deployment Process

### Automatic Deployment

The frontend is automatically deployed to Cloudflare Pages when you push to the main branch of your GitHub repository. This is handled by the GitHub Actions workflow defined in `.github/workflows/cloudflare-pages.yml`.

The workflow:
1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Builds the Next.js application
5. Processes the build with @cloudflare/next-on-pages
6. Deploys to Cloudflare Pages

### Manual Deployment

You can also manually deploy the frontend:

```bash
# Build the Next.js application
npm run build

# Process the build with @cloudflare/next-on-pages
npm run pages:build

# Deploy to Cloudflare Pages
npm run pages:deploy
```

### Local Testing

To test the Cloudflare Pages build locally:

```bash
# Build the Next.js application
npm run build

# Process the build with @cloudflare/next-on-pages
npm run pages:build

# Start a local server
npm run pages:dev
```

## Configuration

### next.config.ts

The Next.js configuration has been updated to be compatible with Cloudflare Pages:

```typescript
const nextConfig: NextConfig = {
  output: 'export', // Required for static site generation
  images: {
    unoptimized: true, // Required for static site generation
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
```

### wrangler.toml

The `wrangler.toml` file configures Cloudflare Pages deployment:

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

> **Important**: The `nodejs_compat` compatibility flag is required for Next.js applications built with @cloudflare/next-on-pages. This flag must be set in both the `wrangler.toml` file and in the Cloudflare Pages dashboard.

### _routes.json

The `public/_routes.json` file configures Cloudflare Pages routing:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/_next/*",
    "/api/*",
    "/_vercel/insights/*"
  ]
}
```

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

> **Note**: All development uses the cloud D1 database as the single source of truth.

## GitHub Secrets

For the GitHub Actions workflow to work, you need to set up the following secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages deployment permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your Cloudflare Worker API

## Cloudflare Pages Dashboard Configuration

### Environment Variables

Set the following environment variables in the Cloudflare Pages dashboard:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your Cloudflare Worker API

### Compatibility Flags

In the Cloudflare Pages dashboard:

1. Go to your project settings
2. Navigate to the "Functions" or "Build & Deploy" section
3. Find "Compatibility flags"
4. Add `nodejs_compat` as a compatibility flag for both Production and Preview environments

> **Important**: Without the `nodejs_compat` flag, your Next.js application will fail with a "Node.JS Compatibility Error" message.

## Troubleshooting

### Build Failures

If the build fails, check:
- The Next.js configuration
- The compatibility of your code with Cloudflare Pages
- The GitHub Actions workflow logs

### Deployment Failures

If deployment fails, check:
- Your Cloudflare API token permissions
- Your Cloudflare account ID
- The GitHub Actions workflow logs

### Runtime Errors

If the deployed site has runtime errors, check:
- The browser console for errors
- The Cloudflare Pages logs
- The compatibility of your code with Cloudflare Pages

### Node.JS Compatibility Error

If you see a "Node.JS Compatibility Error" message:

1. Check that the `nodejs_compat` compatibility flag is set in the Cloudflare Pages dashboard
2. Verify that `compatibility_flags = ["nodejs_compat"]` is in your `wrangler.toml` file
3. Redeploy the application 