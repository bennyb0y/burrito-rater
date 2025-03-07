# Deployment Guide

This guide explains how to deploy the Burrito Rater application to Cloudflare Pages.

## Prerequisites

- Node.js (v18 or later)
- npm (v10 or later)
- Cloudflare account with Pages enabled
- Cloudflare API token with Pages deployment permissions

## Project Structure

The Burrito Rater application consists of two main components:

1. **Frontend**: Next.js application in the `app/` directory
2. **API**: Cloudflare Worker in the `api/worker.js` file

## Wrangler Configuration Files

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

1. Create a `.env.local` file in the project root with the following variables:

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

## Deployment Commands

### Development

For local development:
```bash
npm run dev
```

### API Deployment

To deploy the API worker:
```bash
npm run deploy:worker
```

This command deploys the `api/worker.js` file to Cloudflare Workers using the configuration in `wrangler.worker.toml`.

### Frontend Deployment

To deploy the frontend to Cloudflare Pages:
```bash
npm run deploy
```

This command will:
1. Build the Next.js application
2. Generate static files
3. Deploy to Cloudflare Pages using credentials from `.env.local`
4. Skip account selection prompts
5. Allow deployment with uncommitted changes

### Full Stack Deployment

When making changes to both the frontend and API, deploy in this order:

1. Deploy the API worker first:
   ```bash
   npm run deploy:worker
   ```

2. Then deploy the frontend:
   ```bash
   npm run deploy
   ```

This ensures that any API changes are available when the new frontend is deployed.

### Other Available Commands

- `npm run build` - Build the Next.js application
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run pages:deploy` - Deploy to Cloudflare Pages (requires manual authentication)
- `npm run pages:watch` - Watch for changes during development
- `npm run pages:dev` - Run the application locally with Cloudflare Pages compatibility

## Deployment Process

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

## Troubleshooting

### Common Issues

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

### Environment Variables

Make sure all required environment variables are set in:
- `.env.local` for local development
- Cloudflare Pages environment variables for production

## Best Practices

1. **Version Control**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables for sensitive data
   - Document all environment variables

2. **Deployment**
   - Test locally before deploying
   - Use the automated deployment command
   - Monitor deployment logs

3. **Security**
   - Rotate API tokens regularly
   - Use environment-specific credentials
   - Follow least privilege principle

## Related Documentation

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Documentation](https://nextjs.org/docs)
- [API Worker Documentation](./API_WORKER.md)
- [Workflow Guide](./WORKFLOW.md) 