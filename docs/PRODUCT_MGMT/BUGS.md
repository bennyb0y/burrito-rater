# Known Bugs and Issues

This document tracks known bugs and issues in the Burrito Rater application. Please reference the issue number when fixing bugs and update this list accordingly.

## 🐛 Active Bugs

### High Priority

1. **Mobile Responsiveness Issues** - #001
   - Description: Various UI elements don't display correctly on mobile devices
   - Affected areas: Map view, rating form, navigation
   - Steps to reproduce: Access the site on mobile devices or use responsive design mode in browser dev tools
   - Priority: High

### Medium Priority

2. **Rating Form Validation** - #005
   - Description: Form validation doesn't provide clear error messages for all fields
   - Affected areas: Rating submission form
   - Steps to reproduce: Submit form with invalid data
   - Priority: Medium

3. **Map Marker Clustering** - #006
   - Description: Map markers overlap in areas with many ratings
   - Affected areas: Map view
   - Steps to reproduce: View areas with multiple ratings close together
   - Priority: Medium

4. **Navigation Bar Visibility** - #009
   - Description: Navigation bar can scroll out of view on some mobile and desktop browsers
   - Affected areas: Navigation component across all pages
   - Steps to reproduce: Scroll down slightly on the map view
   - Impact: Minor usability issue, navigation still accessible by scrolling back up
   - Priority: Medium

## 🔄 Recently Fixed Bugs

1. **Admin Rating Management** - #010
   - Description: Delete and bulk confirm functionality was not working correctly
   - Fix: Implemented proper DELETE endpoint and bulk confirmation endpoint in the worker.js file
   - Impact: Admins can now efficiently manage ratings
   - Fixed in version: Latest

2. **USA Location Validation** - #007
   - Description: Ratings could be submitted for locations outside the USA
   - Fix: Implemented bounding box check in the worker.js file to validate coordinates and added error handling in the Map component to display a user-friendly message when a location is outside the USA
   - Fixed in version: Latest

3. **List View Sorting** - #008
   - Description: Sorting in list view was not working correctly
   - Fix: Updated the getSortedRatings function to handle undefined values and ensure proper sorting
   - Fixed in version: Latest

4. **Zipcode Filter with Sorting** - #003
   - Description: Sorting by price/rating and high/low doesn't work correctly when using the zipcode filter
   - Fix: Modified the sorting logic in the list view to properly handle the zipcode filter by ensuring sorting is applied after filtering and handling edge cases with undefined values
   - Fixed in version: Latest

5. **API Connection Errors** - #004
   - Description: Occasional 404 errors when connecting to the API in development environment
   - Fix: Updated the getApiUrl function in config.js to correctly format API endpoints by removing the /api/ prefix when connecting to the Cloudflare Worker API
   - Fixed in version: Latest

6. **Remove Refresh Button** - #002
   - Description: The refresh button was unnecessary and caused confusion
   - Fix: Removed the refresh button from the Map component and implemented automatic refresh when the map view changes. Updated the User Guide to reflect this change.
   - Fixed in version: Latest

## 📝 Reporting New Bugs

When reporting new bugs, please include:

1. A clear and descriptive title
2. Steps to reproduce the bug
3. Expected behavior
4. Actual behavior
5. Screenshots or videos if applicable
6. Browser/device information
7. Any additional context

Submit bug reports through GitHub issues or contact the development team directly.

## 🔍 Bug Triage Process

1. **Identification**: Bug is reported and documented
2. **Verification**: Bug is confirmed and prioritized
3. **Assignment**: Bug is assigned to a developer
4. **Resolution**: Bug is fixed and tested
5. **Closure**: Bug is marked as resolved and moved to "Recently Fixed"

## 📊 Bug Metrics

- **Open Bugs**: 4
- **Recently Fixed**: 6
- **Critical Issues**: 0
- **Average Resolution Time**: 3 days 