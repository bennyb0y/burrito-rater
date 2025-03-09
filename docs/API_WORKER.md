# API Worker Documentation

This document provides information about the Cloudflare Worker API used in the Burrito Rater application.

## Overview

The Burrito Rater API is implemented as a Cloudflare Worker that handles all data operations for the application. It connects to a Cloudflare D1 database to store and retrieve burrito ratings.

## File Structure

- **`api/worker.js`**: The main worker script that handles all API requests
- **`wrangler.worker.toml`**: Configuration file for the worker deployment

## API Endpoints

The worker exposes the following endpoints:

### Ratings

- **GET `/api/ratings`**: Get all ratings
  - Query parameters:
    - `limit`: Maximum number of ratings to return
    - `zipcode`: Filter by zipcode
    - `confirmed`: Filter by confirmation status (0 or 1)
  
- **GET `/api/ratings/:id`**: Get a specific rating by ID

- **POST `/api/ratings`**: Create a new rating
  - Requires a JSON body with rating details
  - Requires a valid Turnstile CAPTCHA token

- **PUT `/api/ratings/:id`**: Update a rating
  - Requires a JSON body with updated rating details

- **DELETE `/api/ratings/:id`**: Delete a rating

- **PUT `/api/ratings/:id/confirm`**: Confirm a specific rating
  - Marks the rating as confirmed (sets `confirmed = 1`)

- **POST `/api/ratings/confirm`**: Bulk confirm ratings
  - Requires a JSON body with an array of rating IDs to confirm

### Migration

- **POST `/api/migrate/add-confirmed-column`**: Add the confirmed column to the Rating table
  - Used for database migrations

## Deployment

To deploy the worker:

```bash
npm run deploy:worker
```

This command uses Wrangler to deploy the `api/worker.js` file to Cloudflare Workers with the configuration specified in `wrangler.worker.toml`.

## Configuration

The project uses two separate Wrangler configuration files for different purposes:

### Worker Configuration (`wrangler.worker.toml`)

This file is specifically for the Cloudflare Worker deployment:

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

The key settings are:
- `main = "api/worker.js"`: Specifies the entry point for the worker
- `[[d1_databases]]`: Configures the D1 database binding

### Pages Configuration (`wrangler.toml`)

This file is used for Cloudflare Pages deployment:

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

The key setting is:
- `pages_build_output_dir = ".vercel/output/static"`: Specifies the directory containing the built static files

Make sure to update the `database_name` and `database_id` with your actual Cloudflare D1 database information in both files.

## Cloudflare Turnstile Integration

The API worker integrates with Cloudflare Turnstile to prevent spam submissions and bot attacks.

### Secret Key Setup

The Turnstile secret key must be set as a Worker secret:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

When prompted, enter your Turnstile secret key. This ensures the secret is securely stored and not exposed in your codebase.

### Token Validation

When a rating is submitted, the worker:

1. Extracts the Turnstile token from the request
2. Validates the token with Cloudflare's verification API
3. Rejects the submission if the token is invalid

The validation function handles:
- Test tokens for development environments
- Production tokens for live environments
- Error handling and logging

### Development Mode

In development mode, the worker accepts:
- Test tokens that start with `test_verification_token_`
- Tokens that start with `0.` when not in production mode
- Provides more lenient validation to facilitate testing

### Production Mode

In production mode, the worker:
- Strictly validates all tokens with Cloudflare's API
- Requires a valid secret key to be set
- Rejects submissions with invalid tokens

For more details on the Turnstile implementation, see the [CAPTCHA Implementation Guide](./CAPTCHA_IMPLEMENTATION.md).

## Development

When making changes to the API:

1. Edit the `api/worker.js` file
2. Deploy the changes using `npm run deploy:worker`
3. Test the API endpoints to ensure they're working correctly

## Error Handling

The worker includes error handling for:
- Invalid requests
- Database errors
- Missing resources
- Authentication failures
- CAPTCHA validation failures

All errors are returned as JSON responses with appropriate HTTP status codes.

## CORS Configuration

The worker is configured to allow cross-origin requests from any origin, which is necessary for the frontend to communicate with the API.

## Security

- The worker does not implement authentication for most endpoints
- Admin operations (like confirming ratings) should be protected in the frontend
- CAPTCHA validation is required for all rating submissions
- Consider adding authentication if deploying in a production environment

## Related Documentation

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [CAPTCHA Implementation Guide](./CAPTCHA_IMPLEMENTATION.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Workflow Guide](./WORKFLOW.md) 