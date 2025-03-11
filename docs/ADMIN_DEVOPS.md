# Burrito Rater Administration and DevOps Guide

This comprehensive guide covers all aspects of deploying, administering, and maintaining the Burrito Rater application, including DevOps workflows and best practices.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Deployment](#deployment)
  - [API Deployment](#api-deployment)
  - [Frontend Deployment](#frontend-deployment)
  - [Full Stack Deployment](#full-stack-deployment)
  - [Deployment Process](#deployment-process)
- [Admin Interface](#admin-interface)
  - [Admin Setup](#admin-setup)
  - [Access and Authentication](#access-and-authentication)
  - [Features](#features)
  - [Implementation Details](#implementation-details)
  - [Confirmation System](#confirmation-system)
- [Development Workflow](#development-workflow)
  - [Local Frontend Development](#local-frontend-development)
  - [API Development](#api-development)
  - [Testing Workflow](#testing-workflow)
- [Component Interaction](#component-interaction)
  - [User Rating Submission Flow](#user-rating-submission-flow)
  - [Admin Confirmation Flow](#admin-confirmation-flow)
  - [Map View Data Flow](#map-view-data-flow)
- [Database Operations](#database-operations)
  - [Database Schema Management](#database-schema-management)
  - [Database Backup Process](#database-backup-process)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
  - [Monitoring Architecture](#monitoring-architecture)
  - [Key Metrics to Monitor](#key-metrics-to-monitor)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [Edge Runtime Error](#edge-runtime-error)
  - [API Connection Issues](#api-connection-issues)
  - [Database Issues](#database-issues)
  - [Authentication Issues](#authentication-issues)
  - [Webpack Module Error](#webpack-module-error)
- [Best Practices](#best-practices)
- [GitHub Integration](#github-integration)

## Architecture Overview

Burrito Rater uses a cloud-first architecture with three main components:

1. **Frontend**: Next.js application deployed to Cloudflare Pages
2. **API**: Cloudflare Worker
3. **Database**: Cloudflare D1 (single source of truth)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Next.js    │────▶│  Cloudflare │────▶│  Cloudflare │
│  App        │     │  Worker API │     │  D1 DB      │
│             │◀────│             │◀────│             │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

For a more detailed view of the architecture within the Cloudflare infrastructure:

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│               Cloudflare Infrastructure               │
│                                                       │
│  ┌───────────┐      ┌───────────┐     ┌───────────┐   │
│  │           │      │           │     │           │   │
│  │ Cloudflare│      │ Cloudflare│     │ Cloudflare│   │
│  │ Pages     │◄────►│ Workers   │◄───►│ D1 DB     │   │
│  │ (Frontend)│      │ (API)     │     │           │   │
│  │           │      │           │     │           │   │
│  └───────────┘      └───────────┘     └───────────┘   │
│        ▲                                              │
└────────┼──────────────────────────────────────────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│                 │
│    End User     │
│    Browser      │
│                 │
└─────────────────┘
```

### Single Source of Truth

A key principle of our architecture is that **Cloudflare D1 is the single source of truth** for all data. This means:

- All environments (development, staging, production) use the same cloud database
- No local database development is needed
- Data is consistent across all environments
- Changes to data are immediately visible to all users
- All data changes are persisted in the cloud database
- No need to sync data between environments

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
  - **`app/admin/`** - Admin interface components
  - **`app/admin/layout.tsx`** - Admin authentication implementation
  - **`app/admin/page.tsx`** - Admin page functionality
- **`api/worker.js`** - The Cloudflare Worker script that handles API requests and database operations
- **`wrangler.toml`** - Configuration for Cloudflare Pages deployment
- **`wrangler.worker.toml`** - Configuration specifically for the Cloudflare Worker deployment
- **`docs/DATABASE_SCHEMA.md`** - The complete database schema definition

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
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

### Cloudflare Pages Dashboard

Set the following environment variables in the Cloudflare Pages dashboard:

1. Go to the Cloudflare Pages dashboard
2. Select your Burrito Rater project
3. Navigate to the "Settings" tab
4. Click on "Environment variables"
5. Add the following variables:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `NEXT_PUBLIC_API_BASE_URL`: The URL of your Cloudflare Worker API
   - `NEXT_PUBLIC_ADMIN_PASSWORD`: Your admin password
6. Save the changes
7. Trigger a new deployment for the changes to take effect

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

The Worker deployment process follows this flow:

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐
│          │     │               │     │               │
│  Local   │────►│  Wrangler     │────►│  Cloudflare   │
│  Dev     │     │  CLI          │     │  Workers      │
│          │     │               │     │               │
└──────────┘     └───────────────┘     └───────────────┘
```

### Frontend Deployment

To deploy the frontend to Cloudflare Pages:
```bash
npm run pages:deploy
```

This command will:
1. Build the Next.js application
2. Generate static files
3. Deploy to Cloudflare Pages using credentials from `.env.local`

#### Build Commands and Edge Runtime Error

There are two build commands available, but only one should be used for production:

- **✅ `npm run pages:deploy`**: 
  - The RECOMMENDED command for production deployments
  - Handles building and deploying in one step
  - Automatically avoids Edge Runtime errors
  - Uses the correct static export configuration
  - Deploys directly to Cloudflare Pages

- **❌ `npm run pages:build` or `npm run build`**:
  - NOT recommended for production deployments
  - Will encounter Edge Runtime errors
  - Should only be used for local testing
  - May show the following error:
    ```
    ERROR: Failed to produce a Cloudflare Pages build from the project.
    
    The following routes were not configured to run with the Edge Runtime:
      - /api/worker
    
    Please make sure that all your non-static routes export the following edge runtime route segment config:
      export const runtime = 'edge';
    ```

#### Why the Edge Runtime Error Occurs

The Edge Runtime error occurs because:
1. The `pages:build` command tries to build the API routes as part of the Next.js application
2. Our API is actually a separate Cloudflare Worker
3. The build process expects Edge Runtime configuration for API routes

To avoid this error:
1. Never use `npm run pages:build` for production
2. Always use `npm run pages:deploy` instead
3. Deploy the API worker separately using `npm run deploy:worker`

#### Correct Deployment Order

Always follow this order when deploying:

1. Deploy the API worker first:
   ```bash
   npm run deploy:worker
   ```

2. Then deploy the frontend:
   ```bash
   npm run pages:deploy
   ```

This ensures that:
- The API is available when the frontend is deployed
- Edge Runtime errors are avoided
- The deployment process is clean and reliable

### Frontend Configuration

#### next.config.ts

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

#### Favicon Configuration

The application uses a burrito emoji (🌯) as its favicon. The setup follows Next.js 13+ app directory conventions:

1. **File Locations**:
   - Place favicon files in the `app` directory (not `public`)
   - Required files:
     - `app/favicon.ico` - Fallback favicon
     - `app/icon.svg` - Primary icon with burrito emoji

2. **SVG Icon Configuration**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24px">🌯</text>
</svg>
```

3. **Metadata Configuration** (`app/layout.tsx`):
```typescript
export const metadata = {
  title: 'Burrito Rater',
  description: 'Rate and discover the best breakfast burritos',
  // No manual icon configuration needed - Next.js will automatically use
  // app/favicon.ico and app/icon.svg
};
```

4. **Important Notes**:
   - Do not place favicon files in the `public` directory
   - Do not manually configure icons in metadata
   - Let Next.js handle favicon routing automatically
   - The app directory favicon takes precedence over public directory

5. **Troubleshooting**:
   - If you see 404/500 errors for favicon requests, check for:
     - Conflicting files in `public` directory
     - Manual icon configurations in metadata
     - Files not being in the `app` directory
   - Clear `.next` directory and restart dev server if changes don't appear

#### _routes.json

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

### Available Commands

- `npm run build` - Build the Next.js application locally
- `npm run pages:build` - Build for Cloudflare Pages (local testing only)
- `npm run pages:deploy` - Build and deploy to Cloudflare Pages (recommended for production)
- `npm run pages:watch` - Watch for changes during development
- `npm run pages:dev` - Run the application locally with Cloudflare Pages compatibility

> **Note**: Always use `npm run pages:deploy` for production deployments. The `pages:build` command is intended for local testing and debugging only.

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

### Admin Setup

The admin section of the Burrito Rater application is protected by a simple password mechanism. This password is stored as an environment variable.

#### Local Development Setup

For local development, the admin password is stored in the `.env.local` file:

```
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

#### Production Setup

For production deployment on Cloudflare Pages, you need to set up the admin password as an environment variable:

1. Go to the Cloudflare Pages dashboard
2. Select your Burrito Rater project
3. Navigate to the "Settings" tab
4. Click on "Environment variables"
5. Add a new variable:
   - Variable name: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - Value: Your secure password
6. Save the changes
7. Trigger a new deployment for the changes to take effect

#### Security Considerations

Please note the following security considerations:

1. The `NEXT_PUBLIC_` prefix means this variable is exposed to the browser. This is necessary for client-side authentication but means the password is not completely secure.
2. This simple password protection is suitable for basic admin access control but is not appropriate for highly sensitive data.
3. For higher security requirements, consider implementing:
   - Server-side authentication
   - OAuth integration
   - Multi-factor authentication

### Access and Authentication

#### URL

Access the admin interface at:
- Local development: http://localhost:3000/admin
- Production: https://your-domain.com/admin

#### Authentication Process

1. When you visit the admin page, you'll be prompted to enter a password.
2. Enter the password set in the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable.
3. If the password is correct, you'll be granted access to the admin interface.
4. Your session will remain active until you log out or close the browser.

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

#### Authentication Features

- **Session Persistence**: Your login session persists until you log out or close the browser
- **Logout**: Securely end your session with the logout button
- **Error Handling**: Clear error messages for authentication issues

### Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status:

1. When an admin confirms a rating, the confirmation status is stored in the D1 database
2. The Map and List views filter ratings based on the confirmation status from the database
3. Confirmations are consistent across all devices and environments
4. Confirmations persist between browser sessions
5. Confirmations are stored in the database and available to all users

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

This will start a local server at http://localhost:8788 that simulates the Cloudflare Pages environment. Note that this is just for testing the build - the application still connects to the Cloudflare Worker API and D1 database in the cloud.

#### Testing API Changes

Since we use a cloud-first approach, API changes are deployed directly to production. For critical changes, consider:

1. Creating a separate Worker for testing
2. Using feature flags to control rollout
3. Implementing proper error handling and fallbacks

## Component Interaction

This section details how different components of the Burrito Rater application interact with each other.

### User Rating Submission Flow

The following diagram illustrates the flow when a user submits a new burrito rating:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │  1  │          │  2  │          │  3  │          │
│  User    │────►│  Next.js │────►│ Cloudflare│────►│  D1 DB   │
│ Browser  │     │ Frontend │     │  Worker  │     │          │
│          │◀────│          │◀────│          │◀────│          │
└──────────┘  6  └──────────┘  5  └──────────┘  4  └──────────┘
```

1. User submits a burrito rating through the frontend interface
2. Next.js frontend sends POST request to Cloudflare Worker API
3. Worker validates the data and inserts it into D1 Database
4. D1 Database confirms successful insertion
5. Worker returns success response to frontend
6. Frontend updates UI to show submission confirmation

### Admin Confirmation Flow

The following diagram illustrates the flow when an admin confirms a rating:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │  1  │          │  2  │          │  3  │          │
│  Admin   │────►│  Admin   │────►│ Cloudflare│────►│  D1 DB   │
│ Browser  │     │ Interface│     │  Worker  │     │          │
│          │◀────│          │◀────│          │◀────│          │
└──────────┘  6  └──────────┘  5  └──────────┘  4  └──────────┘
```

1. Admin logs into the admin interface
2. Admin interface sends confirmation request to Worker API
3. Worker updates rating status in D1 Database
4. D1 Database confirms update
5. Worker returns success response
6. Admin interface updates to show confirmed status

### Map View Data Flow

The following diagram illustrates the flow when a user views the map:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │  1  │          │  2  │          │  3  │          │
│  User    │────►│  Map     │────►│ Cloudflare│────►│  D1 DB   │
│ Browser  │     │ Component│     │  Worker  │     │          │
│          │◀────│          │◀────│          │◀────│          │
└──────────┘  6  └──────────┘  5  └──────────┘  4  └──────────┘
      │              ▲
      │              │
      │      7       │
      └──────────────┘
```

1. User visits the map view
2. Map component requests ratings data from Worker API
3. Worker queries confirmed ratings from D1 Database
4. D1 Database returns confirmed ratings
5. Worker sends ratings data to frontend
6. Map component renders ratings on Google Maps
7. User interacts with map markers to view rating details

## Database Operations

### Database Schema Management

The database schema is documented in `docs/DATABASE_SCHEMA.md` and managed through the Wrangler CLI:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  Schema  │────►│ Wrangler │────►│ Cloudflare│────►│  D1 DB   │
│  Doc     │     │  CLI     │     │  API     │     │          │
│          │     │          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

1. **Schema Definition**: Documented in `docs/DATABASE_SCHEMA.md`
2. **Local Development**: Uses cloud D1 database
3. **Schema Migration**: Applied through Wrangler CLI

### Database Backup Process

Regular backups of the D1 database should be performed:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │
│  D1 DB   │────►│ Wrangler │────►│  Local   │
│          │     │  CLI     │     │  Backup  │
│          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘
```

1. **Export Command**:
   ```
   npx wrangler d1 export <DATABASE_NAME> --output=backup.sql
   ```

2. **Import Command** (for restoration):
   ```
   npx wrangler d1 execute <DATABASE_NAME> --file=backup.sql
   ```

## Monitoring and Maintenance

### Monitoring Architecture

The monitoring architecture for the Burrito Rater application leverages Cloudflare's built-in monitoring tools:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │
│ Cloudflare│────►│ Cloudflare│────►│  Alert   │
│ Services │     │ Dashboard │     │  Notifs  │
│          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘
```

### Key Metrics to Monitor

1. **Worker Performance**:
   - Request count
   - CPU time
   - Error rate

2. **Pages Performance**:
   - Page load time
   - Cache hit ratio
   - Error rate

3. **D1 Database**:
   - Query performance
   - Storage usage
   - Error rate

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

#### Webpack Module Error

If you encounter an error like `Cannot find module './[number].js'` in the development server:

1. Stop the development server
2. Clean the Next.js cache and temporary files:
   ```bash
   rm -rf .next node_modules/.cache
   ```
3. Reinstall dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

This error typically occurs when the Next.js build cache becomes corrupted or out of sync with the current codebase.

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

The troubleshooting process typically follows this pattern:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │
│  Error   │────►│  Error   │────►│ Resolution│
│  Logs    │     │  ID      │     │  Steps    │
│          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘
```

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

### Authentication Issues

If you're having trouble with admin authentication:

1. Verify that the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable is set correctly
2. Check for any whitespace in the password value
3. Ensure the environment variable is available in the client-side code
4. Try clearing your browser's sessionStorage and cache

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
- [Product Management](./PRODUCT_MGMT/) 