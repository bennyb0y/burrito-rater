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