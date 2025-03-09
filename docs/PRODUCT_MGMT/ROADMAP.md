# Burrito Rater Roadmap

This document outlines the key milestones for the Burrito Rater project.

## Steps to Beta Launch

- [X] Restrict ratings to USA only
- [X] Add cloudflare captcha for submissions
- [ ] Set up CI/CD automation for Cloudflare deployment directly from GitHub
- [ ] Implement basic monitoring for API and frontend
- [ ] Add basic admin alerting for critical errors
- [X] Improve error handling for API failures
- [X] Add loading states for API interactions
- [X] Implement user feedback for rating submissions
- [X] Secure Google Maps API key with proper restrictions
- [ ] Conduct basic security audit
- [ ] Create backup and recovery strategy for D1 database
- [ ] Add custom domain configuration
- [ ] Implement rate limiting for submissions
- [ ] **[HIGH PRIORITY]** Fix mobile responsiveness issues
- [ ] Remove unnecessary refresh button from map interface
- [X] Fix zipcode filter with sorting in list view
- [X] Fix API connection errors in development environment

## ✅ Recently Completed

- [X] Implement USA location validation with bounding box check
- [X] Fix list view sorting functionality
- [X] Fix zipcode filter with sorting in list view
- [X] Resolve API connection errors in development environment
- [X] Add Cloudflare Turnstile CAPTCHA for form submissions

## Steps to 1.0

- [ ] Implement more secure admin authentication for /admin
- [ ] Add image upload for burritos
- [ ] Create restaurant profiles
- [ ] Implement social sharing functionality
- [ ] Add comments on restaurant profiles
- [ ] Create "favorite burritos" functionality tied to passwords
- [ ] Add advanced filtering and search
- [ ] Implement proper SEO metadata
- [ ] Add heatmap for popular burrito locations
- [ ] Set up monitoring and alerting for performance metrics
- [ ] Add user profiles based on combination of username + password
- [ ] Implement rating statistics dashboard
- [ ] Add rating editing functionality in admin panel
- [ ] Implement mobile app version with React Native
- [ ] Add offline support for frequent users
- [ ] Create data visualization dashboard for trends
- [ ] Fix all remaining bugs and issues (see [BUGS.md](./BUGS.md)) 