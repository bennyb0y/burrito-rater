# Admin Setup Guide

This document explains how to set up and secure the admin section of the Burrito Rater application, as well as important DevOps considerations.

## Cloud-First Architecture

The Burrito Rater application uses a cloud-first architecture with Cloudflare D1 as the single source of truth for all data. This means:

1. All environments (development and production) use the same cloud database
2. No local database development is needed
3. Data is consistent across all environments
4. Changes to data are immediately visible to all users

## Admin Password Configuration

The admin section of the Burrito Rater application is protected by a simple password mechanism. This password is stored as an environment variable.

### Local Development

For local development, the admin password is stored in the `.env.local` file:

```
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

### Production Deployment

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

## Security Considerations

Please note the following security considerations:

1. The `NEXT_PUBLIC_` prefix means this variable is exposed to the browser. This is necessary for client-side authentication but means the password is not completely secure.
2. This simple password protection is suitable for basic admin access control but is not appropriate for highly sensitive data.
3. For higher security requirements, consider implementing:
   - Server-side authentication
   - OAuth integration
   - Multi-factor authentication

## Accessing the Admin Panel

Once configured, the admin panel can be accessed at:

```
https://your-domain.com/admin
```

You will be prompted to enter the password. Upon successful authentication, your session will remain active until you log out or close the browser.

## Admin Functionality

The admin panel provides the following functionality:

### Rating Management

- **View Ratings**: See all burrito ratings in a tabular format
- **Select Ratings**: Use checkboxes to select individual ratings or select all
- **Delete Ratings**: Delete selected ratings with confirmation
- **View Details**: See detailed information about each rating
- **Confirm Ratings**: Mark ratings as confirmed so they appear on the map and list views

### Authentication Features

- **Session Persistence**: Your login session persists until you log out or close the browser
- **Logout**: Securely end your session with the logout button
- **Error Handling**: Clear error messages for authentication issues

## Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status:

1. When an admin confirms a rating, the confirmation status is stored in the D1 database
2. The Map and List views filter ratings based on the confirmation status from the database
3. Confirmations are consistent across all devices and environments
4. Confirmations persist between browser sessions
5. Confirmations are stored in the database and available to all users

## Implementation Details

The admin authentication is implemented in the `app/admin/layout.tsx` file, which:

1. Checks for an existing authentication session in `sessionStorage`
2. Validates the password against the environment variable
3. Renders either the login form or the admin interface based on authentication status
4. Provides a logout function to clear the session

The admin page functionality is implemented in `app/admin/page.tsx`, which:

1. Fetches ratings from the API
2. Provides UI for selecting and managing ratings
3. Handles deletion and confirmation of ratings through API calls

## DevOps Considerations

### Data Management

Since we use Cloudflare D1 as the single source of truth:

1. All data changes are immediately visible to all users
2. No need to sync data between environments
3. Changes are persisted in the cloud database
4. Data is consistent across all deployments

### Troubleshooting

#### API Connection Issues

If you're having trouble connecting to the API:

1. Check your `.env.local` file to ensure the API URL is set correctly
2. Verify that the Cloudflare Worker is deployed and running
3. Check the browser console for CORS errors or other issues

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

## Related Documentation

For more detailed information about deployment and administration, see the [Deployment and Administration Guide](./DEPLOYMENT_AND_ADMIN.md). 