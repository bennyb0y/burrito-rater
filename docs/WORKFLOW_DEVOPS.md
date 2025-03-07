# Burrito Rater DevOps Workflow Guide

This document provides a comprehensive overview of the Burrito Rater application's architecture, deployment workflow, and operational processes from a DevOps perspective.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Interaction](#component-interaction)
3. [Deployment Workflow](#deployment-workflow)
4. [Database Operations](#database-operations)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Troubleshooting](#troubleshooting)

## Architecture Overview

The Burrito Rater application uses a modern serverless architecture built on Cloudflare's edge infrastructure:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     Cloudflare Infrastructure                   │
│                                                                 │
│  ┌───────────────┐      ┌───────────────┐     ┌──────────────┐  │
│  │               │      │               │     │              │  │
│  │ Cloudflare    │      │ Cloudflare    │     │ Cloudflare   │  │
│  │ Pages         │◄────►│ Workers       │◄───►│ D1 Database  │  │
│  │ (Frontend)    │      │ (API Backend) │     │              │  │
│  │               │      │               │     │              │  │
│  └───────────────┘      └───────────────┘     └──────────────┘  │
│          ▲                                                      │
└──────────┼──────────────────────────────────────────────────────┘
           │
           │ HTTPS
           │
┌──────────▼──────────┐
│                     │
│    End User         │
│    Web Browser      │
│                     │
└─────────────────────┘
```

### Key Components:

1. **Frontend (Next.js)**: Static site hosted on Cloudflare Pages
2. **Backend API**: Cloudflare Workers running serverless JavaScript
3. **Database**: Cloudflare D1 (SQLite-compatible database at the edge)
4. **DNS & CDN**: Cloudflare's global network

## Component Interaction

### User Rating Submission Flow

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────────┐
│          │  1  │               │  2  │               │  3  │              │
│  User    │────►│  Next.js      │────►│  Cloudflare   │────►│  D1 Database │
│ Browser  │     │  Frontend     │     │  Worker       │     │              │
│          │◄────│               │◄────│               │◄────│              │
└──────────┘  6  └───────────────┘  5  └───────────────┘  4  └──────────────┘
```

1. User submits a burrito rating through the frontend interface
2. Next.js frontend sends POST request to Cloudflare Worker API
3. Worker validates the data and inserts it into D1 Database
4. D1 Database confirms successful insertion
5. Worker returns success response to frontend
6. Frontend updates UI to show submission confirmation

### Admin Confirmation Flow

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────────┐
│          │  1  │               │  2  │               │  3  │              │
│  Admin   │────►│  Admin        │────►│  Cloudflare   │────►│  D1 Database │
│ Browser  │     │  Interface    │     │  Worker       │     │              │
│          │◄────│               │◄────│               │◄────│              │
└──────────┘  6  └───────────────┘  5  └───────────────┘  4  └──────────────┘
```

1. Admin logs into the admin interface
2. Admin interface sends confirmation request to Worker API
3. Worker updates rating status in D1 Database
4. D1 Database confirms update
5. Worker returns success response
6. Admin interface updates to show confirmed status

### Map View Data Flow

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────────┐
│          │  1  │               │  2  │               │  3  │              │
│  User    │────►│  Map          │────►│  Cloudflare   │────►│  D1 Database │
│ Browser  │     │  Component    │     │  Worker       │     │              │
│          │◄────│               │◄────│               │◄────│              │
└──────────┘  6  └───────────────┘  5  └───────────────┘  4  └──────────────┘
      │                  ▲
      │                  │
      │        7         │
      └──────────────────┘
```

1. User visits the map view
2. Map component requests ratings data from Worker API
3. Worker queries confirmed ratings from D1 Database
4. D1 Database returns confirmed ratings
5. Worker sends ratings data to frontend
6. Map component renders ratings on Google Maps
7. User interacts with map markers to view rating details

## Deployment Workflow

### Frontend Deployment Process

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────────┐
│          │     │               │     │               │     │              │
│  Local   │────►│  GitHub       │────►│  Cloudflare   │────►│  Cloudflare  │
│  Dev     │     │  Repository   │     │  Pages CI/CD  │     │  Pages       │
│          │     │               │     │               │     │              │
└──────────┘     └───────────────┘     └───────────────┘     └──────────────┘
```

1. **Local Development**:
   ```
   npm run dev
   ```

2. **Build Process**:
   ```
   npm run pages:build
   ```

3. **Deployment**:
   ```
   npm run pages:deploy
   ```

### Worker Deployment Process

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐
│          │     │               │     │               │
│  Local   │────►│  Wrangler     │────►│  Cloudflare   │
│  Dev     │     │  CLI          │     │  Workers      │
│          │     │               │     │               │
└──────────┘     └───────────────┘     └───────────────┘
```

1. **Local Development**:
   ```
   npm run dev:worker
   ```

2. **Deployment**:
   ```
   npm run deploy:worker
   ```

## Database Operations

### Database Schema Management

```
┌──────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────────┐
│          │     │               │     │               │     │              │
│  Schema  │────►│  Wrangler     │────►│  Cloudflare   │────►│  D1 Database │
│  SQL     │     │  CLI          │     │  API          │     │              │
│          │     │               │     │               │     │              │
└──────────┘     └───────────────┘     └───────────────┘     └──────────────┘
```

1. **Schema Definition**: Maintained in `schema.sql`
2. **Local Development**: Uses local D1 database
3. **Schema Migration**: Applied through Wrangler CLI

### Database Backup Process

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│              │     │               │     │               │
│  D1 Database │────►│  Wrangler     │────►│  Local Backup │
│              │     │  CLI          │     │  File         │
│              │     │               │     │               │
└──────────────┘     └───────────────┘     └───────────────┘
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

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│              │     │               │     │               │
│  Cloudflare  │────►│  Cloudflare   │────►│  Alert        │
│  Services    │     │  Dashboard    │     │  Notifications │
│              │     │               │     │               │
└──────────────┘     └───────────────┘     └───────────────┘
```

### Key Metrics to Monitor:

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

### Common Issues and Resolution Paths

#### 1. Frontend Deployment Failures

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│              │     │               │     │               │
│  Build Logs  │────►│  Error        │────►│  Resolution   │
│              │     │  Identification│     │  Steps        │
│              │     │               │     │               │
└──────────────┘     └───────────────┘     └───────────────┘
```

- Check build logs in Cloudflare Pages dashboard
- Verify environment variables are correctly set
- Ensure API keys and secrets are properly configured

#### 2. API Errors

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│              │     │               │     │               │
│  Worker Logs │────►│  Error        │────►│  Resolution   │
│              │     │  Identification│     │  Steps        │
│              │     │               │     │               │
└──────────────┘     └───────────────┘     └───────────────┘
```

- Check Worker logs in Cloudflare dashboard
- Verify Worker routes are correctly configured
- Ensure database bindings are properly set up

#### 3. Database Connection Issues

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│              │     │               │     │               │
│  D1 Logs     │────►│  Error        │────►│  Resolution   │
│              │     │  Identification│     │  Steps        │
│              │     │               │     │               │
└──────────────┘     └───────────────┘     └───────────────┘
```

- Check D1 logs in Cloudflare dashboard
- Verify database bindings in Worker configuration
- Ensure SQL queries are properly formatted

## Conclusion

This DevOps workflow guide provides a comprehensive overview of the Burrito Rater application's architecture, deployment processes, and operational considerations. By following these workflows and understanding the component interactions, you can effectively manage and maintain the application infrastructure. 