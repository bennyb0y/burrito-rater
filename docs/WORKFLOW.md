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

For frontend development, you only need to run the Next.js development server:

```bash
npm run dev
```

This starts the Next.js app on http://localhost:3000, which connects to the Cloudflare Worker API hosted in the cloud. The API, in turn, connects to the Cloudflare D1 database.

**Key points:**
- You're working with real data from the cloud database
- API calls go to the production Cloudflare Worker
- Changes to the frontend are immediately visible locally
- No need to set up a local database

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
- API changes are deployed directly to production
- The Worker connects to the Cloudflare D1 database
- No local API development environment is needed

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

This will start a local server at http://localhost:8788 that simulates the Cloudflare Pages environment.

### Testing API Changes

Since we use a cloud-first approach, API changes are deployed directly to production. For critical changes, consider:

1. Creating a separate Worker for testing
2. Using feature flags to control rollout
3. Implementing proper error handling and fallbacks

## Deployment Workflow

### Frontend Deployment

#### Automatic Deployment (Recommended)

The frontend is automatically deployed to Cloudflare Pages when you push to the main branch of your GitHub repository. This is handled by the GitHub Actions workflow defined in `.github/workflows/cloudflare-pages.yml`.

The workflow:
1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Builds the Next.js application
5. Processes the build with @cloudflare/next-on-pages
6. Deploys to Cloudflare Pages

#### Manual Deployment

You can also manually deploy the frontend:

```bash
# Build the Next.js application
npm run build

# Process the build with @cloudflare/next-on-pages
npm run pages:build

# Deploy to Cloudflare Pages
npm run pages:deploy
```

### API Deployment

To deploy changes to the Cloudflare Worker API:

```bash
npm run deploy:worker
```

This command deploys the `worker.js` file to Cloudflare Workers with the required `nodejs_compat` compatibility flag.

## Configuration Requirements

### Environment Variables

#### Local Development (.env.local)

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=https://your-worker-name.your-account.workers.dev
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

1. Check the Cloudflare D1 dashboard to ensure the database exists
2. Verify that the database ID in `wrangler.toml` matches the actual database ID
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

## Project Structure and Organization

### Key Files and Directories

- **`app/`** - Contains the Next.js application code
- **`api/worker.js`** - The Cloudflare Worker script that handles API requests and database operations
- **`wrangler.toml`** - Configuration for Cloudflare Pages deployment
- **`wrangler.worker.toml`** - Configuration specifically for the Cloudflare Worker deployment
- **`schema.sql`** - The database schema definition

### File Organization Recommendations

For better organization, consider restructuring the project as follows:

1. **Move `worker.js` to a dedicated directory:**
   ```bash
   mkdir -p api
   mv worker.js api/
   ```
   Then update `package.json` and `wrangler.worker.toml` to reference the new location.

2. **Remove unnecessary files:**
   ```bash
   rm -rf app-backup/ .git.backup/ replacements.txt _routes.json
   ```

3. **Consolidate wrangler configuration files:**
   Consider merging `wrangler.toml` and `wrangler.worker.toml` if possible, or clearly document their separate purposes.

### Current Structure Explanation

The current structure maintains:
- `worker.js` in the root directory as the Cloudflare Worker script
- Separate configuration files for Pages and Worker deployments
- Both the frontend and API in the same repository

This approach works but could be improved for clarity and maintainability. 