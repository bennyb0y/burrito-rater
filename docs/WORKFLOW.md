# Burrito Rater Workflow Guide

This document outlines the complete workflow for developing, testing, and deploying the Burrito Rater application, from local development to production deployment.

## Architecture Overview

Burrito Rater uses a cloud-first architecture with three main components:

1. **Frontend**: Next.js application deployed to Cloudflare Pages
2. **API**: Cloudflare Worker
3. **Database**: Cloudflare D1 (single source of truth)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js App    │────▶│  Cloudflare     │────▶│  Cloudflare D1  │
│  (Cloudflare    │     │  Worker API     │     │  Database       │
│   Pages)        │◀────│                 │◀────│                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Single Source of Truth

A key principle of our architecture is that **Cloudflare D1 is the single source of truth** for all data. This means:

- All environments (development, staging, production) use the same cloud database
- No local database development is needed
- Data is consistent across all environments
- Changes to data are immediately visible to all users

## Development Workflow

### 1. Local Frontend Development

For frontend development, you run the Next.js development server locally while connecting to the remote Cloudflare Worker API and D1 database:

```bash
npm run dev
```

This starts the Next.js app on http://localhost:3000, which connects to the Cloudflare Worker API hosted in the cloud. The API, in turn, connects to the Cloudflare D1 database.

**Key points:**
- Your local frontend connects to the production Cloudflare Worker API
- You're working with real data from the cloud D1 database
- No local worker or database setup is required
- Changes to the frontend are immediately visible locally

### 2. Admin Access

The application includes a password-protected admin section for managing burrito ratings:

#### Local Development
1. Ensure the admin password is set in your `.env.local` file:
   ```
   NEXT_PUBLIC_ADMIN_PASSWORD=your_password
   ```
2. Access the admin panel at http://localhost:3000/admin
3. Enter the password to log in

#### Production
1. Set the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable in the Cloudflare Pages dashboard
2. Access the admin panel at your deployed URL (e.g., https://burrito-rater.pages.dev/admin)
3. Enter the password to log in

For more details on admin setup, see the [Admin Setup Guide](./ADMIN_SETUP.md).

### 3. API Development

When making changes to the API:

1. Edit the `worker.js` file
2. Deploy the changes to Cloudflare:
   ```bash
   npm run deploy:worker
   ```

The `deploy:worker` script uses the `wrangler deploy` command to upload your Worker to Cloudflare with the required `nodejs_compat` compatibility flag.

**Key points:**
- API changes are deployed directly to the production Cloudflare Worker
- The Worker connects to the production Cloudflare D1 database
- No local API server or database is used at any point

## Testing Workflow

### Testing Frontend Changes

To test frontend changes before deployment:

1. Build the Next.js application:
   ```bash
   npm run build
   ```

2. Process the build with @cloudflare/next-on-pages:
   ```bash
   npm run pages:build
   ```

3. Start a local server to test the Pages build:
   ```bash
   npm run pages:dev
   ```

This will start a local server at http://localhost:8788 that simulates the Cloudflare Pages environment. Note that this local server still connects to the production Cloudflare Worker API and D1 database.

### Testing API Changes

Since we use a cloud-first approach, API changes are deployed directly to production. For critical changes, consider:

1. Creating a separate Worker for testing
2. Using feature flags to control rollout
3. Implementing proper error handling and fallbacks

## Deployment Workflow

### Prerequisites

Before deploying, ensure you have:

1. Cloudflare account credentials in your `.env.local` file:
   ```
   CF_ACCOUNT_ID=your_cloudflare_account_id
   CF_API_TOKEN=your_cloudflare_api_token
   ```
2. The latest code changes committed (or use `--commit-dirty=true` flag)
3. Node.js and npm installed
4. Wrangler CLI installed globally or available via npx

### Frontend Deployment

#### One-Command Deployment (Recommended)

The simplest way to deploy the frontend is using the deploy script:

```bash
npm run deploy
```

This command:
1. Builds the Next.js application
2. Processes the build with @cloudflare/next-on-pages
3. Deploys to Cloudflare Pages using your Cloudflare credentials from environment variables

Under the hood, this runs:
```bash
npm run pages:build && CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT_ID CLOUDFLARE_API_TOKEN=$CF_API_TOKEN npx wrangler pages deploy .vercel/output/static --project-name burrito-rater --commit-dirty=true
```

#### Manual Step-by-Step Deployment

You can also manually deploy the frontend step by step:

```bash
# 1. Clean up previous build artifacts (optional but recommended)
rm -rf .next out .vercel

# 2. Install dependencies (if needed)
npm install

# 3. Build the Next.js application
npm run build

# 4. Process the build with @cloudflare/next-on-pages
npm run pages:build

# 5. Deploy to Cloudflare Pages
CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT_ID CLOUDFLARE_API_TOKEN=$CF_API_TOKEN npx wrangler pages deploy .vercel/output/static --project-name burrito-rater --commit-dirty=true
```

The deployment will output a URL where your application is accessible (e.g., `https://[hash].burrito-rater.pages.dev`).

### API Deployment

To deploy changes to the Cloudflare Worker API:

```bash
# Deploy the worker
npm run deploy:worker
```

This command deploys the `worker.js` file to Cloudflare Workers with the required `nodejs_compat` compatibility flag.

Under the hood, this runs:
```bash
npx wrangler deploy worker.js
```

### Full Stack Deployment

When making changes to both the frontend and API, deploy in this order:

1. Deploy the API changes first:
   ```bash
   npm run deploy:worker
   ```

2. Then deploy the frontend:
   ```bash
   npm run deploy
   ```

This ensures that any API changes are available when the new frontend is deployed.

### Deployment Verification

After deployment, verify that:

1. The frontend is accessible at the Cloudflare Pages URL
2. The API endpoints are responding correctly
3. The application is functioning as expected

You can check the deployment status and logs in the Cloudflare dashboard under Pages > burrito-rater > Deployments.

### Rollback Procedure

If issues are detected after deployment:

1. For frontend issues, you can roll back to a previous deployment in the Cloudflare Pages dashboard
2. For API issues, revert your changes to `worker.js` and redeploy:
   ```bash
   git checkout [previous_commit] worker.js
   npm run deploy:worker
   ```

## Configuration Requirements

### Environment Variables

#### Local Development (.env.local)

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=https://burrito-rater.your-account.workers.dev
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_API_TOKEN=your_cloudflare_api_token
```

#### Cloudflare Pages Dashboard

Set the following environment variables in the Cloudflare Pages dashboard:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your Cloudflare Worker API

### Compatibility Flags

For Cloudflare Pages deployment, ensure:

1. The `wrangler.toml` file includes:
   ```toml
   compatibility_flags = ["nodejs_compat"]
   pages_build_output_dir = ".vercel/output/static"
   ```

2. The `nodejs_compat` compatibility flag is also set in the Cloudflare Pages dashboard:
   - Go to your project settings
   - Navigate to the "Functions" or "Build & Deploy" section
   - Find "Compatibility flags"
   - Add `nodejs_compat` as a compatibility flag for both Production and Preview environments

## GitHub Integration

### GitHub Secrets

For the GitHub Actions workflow to work, you need to set up the following secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages deployment permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your Cloudflare Worker API

### Continuous Integration

The GitHub Actions workflow automatically builds and deploys the frontend whenever changes are pushed to the main branch. This ensures that:

1. The latest code is always deployed
2. The build process is consistent
3. Deployment is automated and reliable

## Troubleshooting

### Common Issues

#### Node.JS Compatibility Error

If you see a "Node.JS Compatibility Error" message:

1. Check that the `nodejs_compat` compatibility flag is set in the Cloudflare Pages dashboard
2. Verify that `compatibility_flags = ["nodejs_compat"]` is in your `wrangler.toml` file
3. Redeploy the application

#### API Connection Issues

If you're having trouble connecting to the API:

1. Check your `.env.local` file to ensure `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. Verify that the Cloudflare Worker is deployed and running
3. Check the browser console for CORS errors

#### Database Issues

If you're experiencing database issues:

1. Check the Cloudflare D1 dashboard to ensure the database exists and is accessible
2. Verify that the database binding in the Cloudflare Worker is correct
3. Check the Cloudflare Worker logs for any database connection errors

## Best Practices

1. **Commit Often**: Make small, focused commits with clear messages
2. **Use Feature Branches**: Create a new branch for each feature or bug fix
3. **Test Before Deployment**: Always test changes locally before deploying
4. **Monitor Deployments**: Check the Cloudflare dashboard for deployment status and logs
5. **Keep Secrets Secure**: Never commit API keys or sensitive information to version control
6. **Document Changes**: Update documentation when making significant changes
7. **Follow the Single Source of Truth Principle**: All data should come from the Cloudflare D1 database

## Conclusion

This workflow guide outlines the development, testing, and deployment process for the Burrito Rater application. By following these guidelines, you can ensure a smooth and efficient development experience while maintaining a reliable and consistent application across all environments. 