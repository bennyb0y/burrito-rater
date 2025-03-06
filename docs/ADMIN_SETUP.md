# Admin Setup Guide

This document explains how to set up and secure the admin section of the Burrito Rater application.

## Password Protection

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
   - Value: Your secure password (e.g., `burrito123`)
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
- **View Details**: See detailed information about each rating, including:
  - Restaurant name
  - Burrito title
  - Rating score
  - Reviewer information

### Authentication Features

- **Session Persistence**: Your login session persists until you log out or close the browser
- **Logout**: Securely end your session with the logout button
- **Error Handling**: Clear error messages for authentication issues

### Implementation Details

The admin authentication is implemented in the `app/admin/layout.tsx` file, which:

1. Checks for an existing authentication session in `sessionStorage`
2. Validates the password against the environment variable
3. Renders either the login form or the admin interface based on authentication status
4. Provides a logout function to clear the session

The admin page functionality is implemented in `app/admin/page.tsx`, which:

1. Fetches ratings from the API
2. Provides UI for selecting and managing ratings
3. Handles deletion of ratings through API calls 