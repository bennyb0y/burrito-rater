# Burrito Rater Deployment and Administration Guide

This guide provides comprehensive information about deploying and administering the Burrito Rater application.

## Table of Contents

- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Project Structure](#project-structure)
  - [Environment Setup](#environment-setup)
  - [Deployment Commands](#deployment-commands)
  - [Troubleshooting](#troubleshooting)
  - [Best Practices](#best-practices)
- [Admin Interface](#admin-interface)
  - [Access](#access)
  - [Features](#features)
  - [Implementation Details](#implementation-details)
  - [Troubleshooting](#admin-troubleshooting)

## Deployment

### Prerequisites

- Node.js (v18 or later)
- npm (v10 or later)
- Cloudflare account with Pages enabled
- Cloudflare API token with Pages deployment permissions

### Project Structure

The Burrito Rater application consists of two main components:

1. **Frontend**: Next.js application in the `app/` directory
2. **API**: Cloudflare Worker in the `api/worker.js` file

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

### Environment Setup

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

### Deployment Commands

#### Development

For local development:
```bash
npm run dev
```

#### API Deployment

To deploy the API worker:
```bash
npm run deploy:worker
```

This command deploys the `api/worker.js` file to Cloudflare Workers using the configuration in `wrangler.worker.toml`.

#### Frontend Deployment

To deploy the frontend to Cloudflare Pages:
```bash
npm run pages:deploy
```

This command will:
1. Build the Next.js application
2. Generate static files
3. Deploy to Cloudflare Pages using credentials from `.env.local`

> **IMPORTANT**: Do not use `npm run deploy` as it may cause Edge Runtime errors (see [Edge Runtime Error](#edge-runtime-error) section below).

#### Full Stack Deployment

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

#### Other Available Commands

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

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Deployment Failures**
   - Verify Cloudflare credentials in `.env.local`
   - Check API token permissions
   - Ensure project name matches Cloudflare Pages project

3. **Runtime Errors**
   - Check environment variables
   - Verify API endpoints
   - Check browser console for errors

4. **Worker Deployment Issues**
   - Ensure `api/worker.js` exists and is correctly formatted
   - Check that `wrangler.worker.toml` has the correct path (`main = "api/worker.js"`)
   - Verify D1 database bindings are correct

#### Edge Runtime Error

When deploying with `npm run deploy` or `npm run pages:build`, you may encounter the following error:

```
ERROR: Failed to produce a Cloudflare Pages build from the project.

     The following routes were not configured to run with the Edge Runtime:
       - /api/worker

     Please make sure that all your non-static routes export the following edge runtime route segment config:
       export const runtime = 'edge';
```

This error occurs because the build process is trying to deploy the API worker as a Next.js API route, but it's not configured to use the Edge Runtime.

##### How to Fix

There are two ways to fix this issue:

1. **Recommended Approach**: Deploy the frontend and API separately
   - Deploy the API worker using `npm run deploy:worker`
   - Deploy the frontend using `npm run pages:deploy`

2. **Alternative Approach**: Add Edge Runtime configuration to the API worker
   - Add `export const runtime = 'edge';` to the top of your API route files
   - Note: This approach is not recommended for this project as we're using a separate Cloudflare Worker for the API

##### Why This Happens

This project uses a separate Cloudflare Worker for the API instead of Next.js API routes. The build process detects the `/api/worker` path and tries to treat it as a Next.js API route, which requires the Edge Runtime configuration.

By using `npm run pages:deploy` instead of `npm run deploy`, you bypass this check and deploy only the static files, which is the intended behavior for this project.

### Best Practices

1. **Version Control**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables for sensitive data
   - Document all environment variables

2. **Deployment**
   - Test locally before deploying
   - Use the automated deployment command
   - Monitor deployment logs
   - Always deploy the API worker and frontend separately to avoid Edge Runtime errors

3. **Security**
   - Rotate API tokens regularly
   - Use environment-specific credentials
   - Follow least privilege principle

## Admin Interface

The admin interface allows authorized users to manage burrito ratings, including viewing, confirming, and deleting ratings.

### Access

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

#### Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status:

1. When an admin confirms a rating, the confirmation status is stored in the D1 database.
2. The Map and List views filter ratings based on the confirmation status from the database.
3. This ensures that confirmations are consistent across all devices and environments.

### Admin Troubleshooting

#### Common Issues

1. **Password Not Working**:
   - Verify that the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable is set correctly
   - Check for any whitespace in the password value
   - Ensure the environment variable is available in the client-side code

2. **Ratings Not Appearing as Confirmed**:
   - Verify that the confirmation API calls are working correctly
   - Check the browser console for any API errors
   - Ensure the D1 database is properly configured

3. **API Errors**:
   - Check the browser console for specific error messages
   - Verify that the API endpoints are configured correctly
   - Ensure the Cloudflare Worker is deployed and running

## Related Documentation

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Documentation](https://nextjs.org/docs)
- [API Worker Documentation](./API_WORKER.md)
- [Workflow Guide](./WORKFLOW.md) 