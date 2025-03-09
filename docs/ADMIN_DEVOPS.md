# Burrito Rater Administration and DevOps Guide

This comprehensive guide covers all aspects of deploying, administering, and maintaining the Burrito Rater application, including DevOps workflows and best practices.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment](#deployment)
  - [API Deployment](#api-deployment)
  - [Frontend Deployment](#frontend-deployment)
  - [Full Stack Deployment](#full-stack-deployment)
  - [Deployment Process](#deployment-process)
- [Admin Interface](#admin-interface)
  - [Access and Authentication](#access-and-authentication)
  - [Features](#features)
  - [Implementation Details](#implementation-details)
- [Development Workflow](#development-workflow)
  - [Local Frontend Development](#local-frontend-development)
  - [API Development](#api-development)
  - [Testing Workflow](#testing-workflow)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Edge Runtime Error](#edge-runtime-error)
- [Best Practices](#best-practices)
- [GitHub Integration](#github-integration)

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

### Single Source of Truth

A key principle of our architecture is that **Cloudflare D1 is the single source of truth** for all data. This means:

- All environments (development, staging, production) use the same cloud database
- No local database development is needed
- Data is consistent across all environments
- Changes to data are immediately visible to all users

## Prerequisites

- Node.js (v18 or later)
- npm (v10 or later)
- Cloudflare account with Pages enabled
- Cloudflare API token with Pages deployment permissions

## Project Structure

The Burrito Rater application consists of two main components:

1. **Frontend**: Next.js application in the `app/` directory
2. **API**: Cloudflare Worker in the `api/worker.js` file

### Key Files and Directories

- **`app/`** - Contains the Next.js application code
- **`api/worker.js`** - The Cloudflare Worker script that handles API requests and database operations
- **`wrangler.toml`** - Configuration for Cloudflare Pages deployment
- **`wrangler.worker.toml`** - Configuration specifically for the Cloudflare Worker deployment
- **`schema.sql`** - The database schema definition

### Wrangler Configuration Files

The project uses two separate Wrangler configuration files:

1. **`wrangler.toml`**: Used for Cloudflare Pages deployment
   ```toml
   name = "burrito-rater"
   compatibility_date = "2023-09-01"
   compatibility_flags = ["nodejs_compat"]
   pages_build_output_dir = ".vercel/output/static"
   
   [[d1_databases]]
   binding = "DB"
   database_name = "your-database-name"
   database_id = "your-database-id"
   ```

2. **`wrangler.worker.toml`**: Used for Cloudflare Worker deployment
   ```toml
   name = "burrito-rater"
   compatibility_date = "2023-09-01"
   compatibility_flags = ["nodejs_compat"]
   main = "api/worker.js"
   
   [[d1_databases]]
   binding = "DB"
   database_name = "your-database-name"
   database_id = "your-database-id"
   ```

These files are kept separate because they serve different purposes and have different configuration requirements.

## Environment Setup

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-worker-name.your-account.workers.dev

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudflare Credentials
CF_ACCOUNT_ID=your_account_id
CF_API_TOKEN=your_api_token

# Database Configuration
DATABASE_URL=your_database_name

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

### Cloudflare Pages Dashboard

Set the following environment variables in the Cloudflare Pages dashboard:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your Cloudflare Worker API
- `NEXT_PUBLIC_ADMIN_PASSWORD`: Your admin password

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

## Deployment

### Development

For local development:
```bash
npm run dev
```

This starts the Next.js app on http://localhost:3000, which connects to the Cloudflare Worker API hosted in the cloud.

### API Deployment

To deploy the API worker:
```bash
npm run deploy:worker
```

This command deploys the `api/worker.js` file to Cloudflare Workers using the configuration in `wrangler.worker.toml`.

### Frontend Deployment

To deploy the frontend to Cloudflare Pages:
```bash
npm run pages:deploy
```

This command will:
1. Build the Next.js application
2. Generate static files
3. Deploy to Cloudflare Pages using credentials from `.env.local`

> **IMPORTANT**: Do not use `npm run deploy` as it may cause Edge Runtime errors (see [Edge Runtime Error](#edge-runtime-error) section below).

### Full Stack Deployment

When making changes to both the frontend and API, deploy in this order:

1. Deploy the API worker first:
   ```bash
   npm run deploy:worker
   ```

2. Then deploy the frontend:
   ```bash
   npm run pages:deploy
   ```

This ensures that any API changes are available when the new frontend is deployed.

### Automatic Deployment (GitHub Integration)

The frontend is automatically deployed to Cloudflare Pages when you push to the main branch of your GitHub repository. This is handled by the GitHub Actions workflow defined in `.github/workflows/cloudflare-pages.yml`.

The workflow:
1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Builds the Next.js application
5. Processes the build with @cloudflare/next-on-pages
6. Deploys to Cloudflare Pages

### Other Available Commands

- `npm run build` - Build the Next.js application
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run pages:watch` - Watch for changes during development
- `npm run pages:dev` - Run the application locally with Cloudflare Pages compatibility

### Deployment Process

1. The build process:
   - Compiles Next.js application
   - Generates static pages
   - Optimizes assets
   - Creates Cloudflare Pages worker

2. The deployment process:
   - Uploads static files
   - Configures routing
   - Sets up caching headers
   - Deploys worker

## Admin Interface

The admin interface allows authorized users to manage burrito ratings, including viewing, confirming, and deleting ratings.

### Access and Authentication

The admin interface is password-protected to prevent unauthorized access.

#### URL

Access the admin interface at:
- Local development: http://localhost:3000/admin
- Production: https://your-domain.com/admin

#### Authentication

1. When you visit the admin page, you'll be prompted to enter a password.
2. Enter the password set in the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable.
3. If the password is correct, you'll be granted access to the admin interface.

#### Configuration

To set up the admin password:

1. **Local Development**:
   Add the following to your `.env.local` file:
   ```
   NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
   ```

2. **Production**:
   Add the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable in your Cloudflare Pages dashboard:
   - Go to your Cloudflare Pages project
   - Navigate to Settings > Environment variables
   - Add a new variable with the name `NEXT_PUBLIC_ADMIN_PASSWORD` and your chosen password as the value
   - Deploy your application to apply the changes

#### Security Considerations

Please note the following security considerations:

1. The `NEXT_PUBLIC_` prefix means this variable is exposed to the browser. This is necessary for client-side authentication but means the password is not completely secure.
2. This simple password protection is suitable for basic admin access control but is not appropriate for highly sensitive data.
3. For higher security requirements, consider implementing:
   - Server-side authentication
   - OAuth integration
   - Multi-factor authentication

### Features

#### Rating Management

The admin interface displays a table of all ratings with the following information:
- ID
- User (reviewer name)
- Emoji (reviewer emoji)
- Restaurant
- Burrito Title
- Rating (overall, taste, and value)
- Date submitted
- Status (confirmed or pending)
- Zipcode
- Actions (View, Delete, Confirm)

#### Filtering

The admin interface provides two filtering options:

1. **Status Filter**:
   - All: Shows all ratings
   - Confirmed: Shows only confirmed ratings
   - Unconfirmed: Shows only unconfirmed ratings

2. **Zipcode Filter**:
   - All: Shows ratings from all zipcodes
   - Individual zipcodes: Shows ratings from the selected zipcode only

#### Sorting

You can sort the ratings by clicking on any column header. The sortable columns include:
- ID
- User
- Restaurant
- Burrito Title
- Rating
- Date
- Status
- Zipcode

Clicking a column header toggles between ascending and descending order, indicated by an arrow icon.

#### Confirming Ratings

To confirm a rating:
1. Select the checkbox next to the rating(s) you want to confirm
2. Click the "Confirm" button
3. The rating will be marked as confirmed and will appear on the map and list views

You can also confirm individual ratings by clicking the "Confirm" button in the Actions column.

#### Deleting Ratings

To delete a rating:
1. Select the checkbox next to the rating(s) you want to delete
2. Click the "Delete" button
3. Confirm the deletion in the confirmation dialog
4. The rating will be permanently removed from the database

You can also delete individual ratings by clicking the "Del" button in the Actions column.

#### Viewing Rating Details

To view detailed information about a rating:
1. Click the "View" button in the Actions column
2. A modal will appear showing all details of the rating, including:
   - Restaurant and burrito information
   - Rating scores
   - Ingredients
   - Review text
   - Location data
   - Submission details

### Implementation Details

#### Authentication Implementation

The admin authentication is implemented in the `app/admin/layout.tsx` file, which:

1. Checks for an existing authentication session in `sessionStorage`
2. Validates the password against the environment variable
3. Renders either the login form or the admin interface based on authentication status
4. Provides a logout function to clear the session

#### Admin Page Implementation

The admin page functionality is implemented in `app/admin/page.tsx`, which:

1. Fetches ratings from the API
2. Provides UI for selecting and managing ratings
3. Handles deletion and confirmation of ratings through API calls

#### Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status:

1. When an admin confirms a rating, the confirmation status is stored in the D1 database.
2. The Map and List views filter ratings based on the confirmation status from the database.
3. This ensures that confirmations are consistent across all devices and environments.
4. Confirmations persist between browser sessions.

## Development Workflow

### Local Frontend Development

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

### API Development

When making changes to the API:

1. Edit the `api/worker.js` file
2. Deploy the changes to Cloudflare:
   ```bash
   npm run deploy:worker
   ```

The `deploy:worker` script uses the `wrangler deploy` command to upload your Worker to Cloudflare with the required `nodejs_compat` compatibility flag.

**Key points:**
- API changes are deployed directly to production
- The Worker connects to the Cloudflare D1 database
- No local API development environment is needed

### Testing Workflow

#### Testing Frontend Changes

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

#### Testing API Changes

Since we use a cloud-first approach, API changes are deployed directly to production. For critical changes, consider:

1. Creating a separate Worker for testing
2. Using feature flags to control rollout
3. Implementing proper error handling and fallbacks

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

#### Deployment Failures
- Verify Cloudflare credentials in `.env.local`
- Check API token permissions
- Ensure project name matches Cloudflare Pages project

#### Runtime Errors
- Check environment variables
- Verify API endpoints
- Check browser console for errors

#### Worker Deployment Issues
- Ensure `api/worker.js` exists and is correctly formatted
- Check that `wrangler.worker.toml` has the correct path (`main = "api/worker.js"`)
- Verify D1 database bindings are correct

#### Node.JS Compatibility Error

If you see a "Node.JS Compatibility Error" message:

1. Check that the `nodejs_compat` compatibility flag is set in the Cloudflare Pages dashboard
2. Verify that `compatibility_flags = ["nodejs_compat"]` is in your `wrangler.toml` file
3. Redeploy the application

#### API Connection Issues

If you're having trouble connecting to the API:

1. Check your `.env.local` file to ensure the API URL is set correctly
2. Verify that the Cloudflare Worker is deployed and running
3. Check the browser console for CORS errors

#### Database Issues

If you're experiencing database issues:

1. Check the Cloudflare D1 dashboard to ensure the database exists
2. Verify that the database ID in `wrangler.toml` matches the actual database ID
3. Check the Cloudflare Worker logs for any database connection errors

#### Authentication Issues

If you're having trouble with admin authentication:

1. Verify that the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable is set correctly
2. Check for any whitespace in the password value
3. Ensure the environment variable is available in the client-side code
4. Try clearing your browser's sessionStorage and cache

### Edge Runtime Error

When deploying with `npm run deploy` or `npm run pages:build`, you may encounter the following error:

```
ERROR: Failed to produce a Cloudflare Pages build from the project.

     The following routes were not configured to run with the Edge Runtime:
       - /api/worker

     Please make sure that all your non-static routes export the following edge runtime route segment config:
       export const runtime = 'edge';
```

This error occurs because the build process is trying to deploy the API worker as a Next.js API route, but it's not configured to use the Edge Runtime.

#### How to Fix

There are two ways to fix this issue:

1. **Recommended Approach**: Deploy the frontend and API separately
   - Deploy the API worker using `npm run deploy:worker`
   - Deploy the frontend using `npm run pages:deploy`

2. **Alternative Approach**: Add Edge Runtime configuration to the API worker
   - Add `export const runtime = 'edge';` to the top of your API route files
   - Note: This approach is not recommended for this project as we're using a separate Cloudflare Worker for the API

#### Why This Happens

This project uses a separate Cloudflare Worker for the API instead of Next.js API routes. The build process detects the `/api/worker` path and tries to treat it as a Next.js API route, which requires the Edge Runtime configuration.

By using `npm run pages:deploy` instead of `npm run deploy`, you bypass this check and deploy only the static files, which is the intended behavior for this project.

## Best Practices

### Version Control
- Keep `.env.local` in `.gitignore`
- Use environment variables for sensitive data
- Document all environment variables

### Deployment
- Test locally before deploying
- Use the automated deployment command
- Monitor deployment logs
- Always deploy the API worker and frontend separately to avoid Edge Runtime errors

### Security
- Rotate API tokens regularly
- Use environment-specific credentials
- Follow least privilege principle

### Development
- **Commit Often**: Make small, focused commits with clear messages
- **Use Feature Branches**: Create a new branch for each feature or bug fix
- **Test Before Deployment**: Always test changes locally before deploying
- **Monitor Deployments**: Check the Cloudflare dashboard for deployment status and logs
- **Keep Secrets Secure**: Never commit API keys or sensitive information to version control
- **Document Changes**: Update documentation when making significant changes
- **Follow the Single Source of Truth Principle**: All data should come from the Cloudflare D1 database

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

## Related Documentation

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Documentation](https://nextjs.org/docs)
- [API Worker Documentation](./API_WORKER.md)
- [Database Schema](./DATABASE_SCHEMA.md) 