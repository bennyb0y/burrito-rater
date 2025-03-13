# Known Bugs and Issues

This document tracks known bugs and issues in the Burrito Rater application. Please reference the issue number when fixing bugs and update this list accordingly.

## 🐛 Active Bugs

### High Priority

1. **Search Bar Overlap** - #013
   - Description: Search bar overlaps with rating submission form on mobile devices
   - Affected areas: Rating submission form
   - Steps to reproduce: Open rating submission form on mobile device
   - Priority: High
   - Impact: Poor user experience, potential data entry issues

2. **Navigation Persistence** - #014
   - Description: Navigation bar disappears in map and list views
   - Affected areas: Navigation component across map and list views
   - Steps to reproduce: Scroll in map or list view
   - Priority: High
   - Impact: Poor navigation experience, inconsistent UI behavior

### Medium Priority

1. **Rating Form Validation** - #005
   - Description: Form validation doesn't provide clear error messages for all fields
   - Affected areas: Rating submission form
   - Steps to reproduce: Submit form with invalid data
   - Priority: Medium
   - Impact: User confusion during submission process

2. **Map Marker Clustering** - #006
   - Description: Map markers overlap in areas with many ratings
   - Affected areas: Map view
   - Steps to reproduce: View areas with multiple ratings close together
   - Priority: Medium
   - Impact: Difficulty selecting specific ratings in dense areas

3. **Navigation Bar Visibility** - #009
   - Description: Navigation bar can scroll out of view on some mobile and desktop browsers
   - Affected areas: Navigation component across all pages
   - Steps to reproduce: Scroll down slightly on the map view
   - Impact: Minor usability issue, navigation still accessible by scrolling back up
   - Priority: Medium

## 🔄 Recently Fixed Bugs

1. **Mobile Responsiveness Issues** - #001
   - Description: Various UI elements didn't display correctly on mobile devices
   - Fix: Implemented responsive design fixes across all components
   - Impact: Improved usability on mobile devices
   - Fixed in version: Latest

2. **Admin Directory Structure** - #011
   - Description: Admin interface components were scattered across multiple directories
   - Fix: Reorganized admin interface under unified `/app/admin` directory
   - Impact: Improved code organization and maintainability
   - Fixed in version: Latest

3. **Admin Real-time Updates** - #012
   - Description: Admin interface required manual refresh to see new ratings
   - Fix: Implemented automatic 30-second refresh and event-driven updates
   - Impact: Admins now see new ratings in real-time
   - Fixed in version: Latest

4. **Admin Rating Management** - #010
   - Description: Delete and bulk confirm functionality was not working correctly
   - Fix: Implemented proper DELETE endpoint and bulk confirmation endpoint in the worker.js file
   - Impact: Admins can now efficiently manage ratings
   - Fixed in version: Latest

5. **USA Location Validation** - #007
   - Description: Ratings could be submitted for locations outside the USA
   - Fix: Implemented bounding box check in the worker.js file
   - Impact: Only USA locations can be submitted
   - Fixed in version: Latest

6. **List View Sorting** - #008
   - Description: Sorting in list view was not working correctly
   - Fix: Updated the getSortedRatings function
   - Impact: Proper sorting functionality restored
   - Fixed in version: Latest

7. **Zipcode Filter** - #003
   - Description: Sorting by price/rating didn't work with zipcode filter
   - Fix: Modified sorting logic to handle zipcode filter
   - Impact: Proper filtering and sorting functionality
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

- **Open Bugs**: 6
- **Recently Fixed**: 6
- **Critical Issues**: 2
- **Average Resolution Time**: 3 days 