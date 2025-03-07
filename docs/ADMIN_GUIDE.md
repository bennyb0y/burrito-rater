# Admin Interface Guide

This document provides information about the admin interface for the Burrito Rater application.

## Overview

The admin interface allows authorized users to manage burrito ratings, including:

- Viewing all submitted ratings
- Confirming ratings to display them on the map and list views
- Deleting unwanted or spam ratings
- Filtering ratings by confirmation status and zipcode
- Sorting ratings by any column

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

### Filtering

The admin interface provides two filtering options:

1. **Status Filter**:
   - All: Shows all ratings
   - Confirmed: Shows only confirmed ratings
   - Unconfirmed: Shows only unconfirmed ratings

2. **Zipcode Filter**:
   - All: Shows ratings from all zipcodes
   - Individual zipcodes: Shows ratings from the selected zipcode only

### Sorting

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

### Confirming Ratings

To confirm a rating:
1. Select the checkbox next to the rating(s) you want to confirm
2. Click the "Confirm" button
3. The rating will be marked as confirmed and will appear on the map and list views

You can also confirm individual ratings by clicking the "Confirm" button in the Actions column.

### Deleting Ratings

To delete a rating:
1. Select the checkbox next to the rating(s) you want to delete
2. Click the "Delete" button
3. Confirm the deletion in the confirmation dialog
4. The rating will be permanently removed from the database

You can also delete individual ratings by clicking the "Del" button in the Actions column.

### Viewing Rating Details

To view detailed information about a rating:
1. Click the "View" button in the Actions column
2. A modal will appear showing all details of the rating, including:
   - Restaurant and burrito information
   - Rating scores
   - Ingredients
   - Review text
   - Location data
   - Submission details

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