# Admin Interface Guide

This document provides information about the admin interface for the Burrito Rater application.

## Overview

The admin interface allows authorized users to manage burrito ratings, including:

- Viewing all submitted ratings
- Confirming ratings to display them on the map and list views
- Deleting unwanted or spam ratings
- Filtering ratings by confirmation status

## Access

The admin interface is password-protected to prevent unauthorized access.

### URL

Access the admin interface at:
- Local development: http://localhost:3000/admin
- Production: https://your-domain.com/admin

### Authentication

1. When you visit the admin page, you'll be prompted to enter a password.
2. Enter the password set in the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable.
3. If the password is correct, you'll be granted access to the admin interface.

## Configuration

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

## Features

### Rating Management

The admin interface displays a table of all ratings with the following information:
- Title
- Rating (out of 5)
- Price
- Location
- Date submitted
- Confirmation status

### Filtering

Use the filter dropdown to view:
- All ratings
- Confirmed ratings only
- Unconfirmed ratings only

### Confirming Ratings

To confirm a rating:
1. Select the checkbox next to the rating(s) you want to confirm
2. Click the "Confirm Selected" button
3. The rating will be marked as confirmed and will appear on the map and list views

### Deleting Ratings

To delete a rating:
1. Select the checkbox next to the rating(s) you want to delete
2. Click the "Delete Selected" button
3. Confirm the deletion in the confirmation dialog
4. The rating will be permanently removed from the database

## Implementation Details

### Confirmation System

The application uses Cloudflare D1 database for storing and managing confirmation status:

1. When an admin confirms a rating, the confirmation status is stored in the D1 database.
2. The Map and List views filter ratings based on the confirmation status from the database.
3. This ensures that confirmations are consistent across all devices and environments.

### Known Limitations

1. **API Integration**: The backend API handles confirmations through the Cloudflare D1 database. The database schema has been updated to include a `confirmed` column.

## Future Improvements

1. **User Authentication**: Implement proper user authentication for the admin interface.

2. **Audit Logging**: Add logging for admin actions to track who confirmed or deleted ratings.

3. **Bulk Actions**: Enhance bulk confirmation and deletion capabilities.

## Troubleshooting

### Common Issues

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