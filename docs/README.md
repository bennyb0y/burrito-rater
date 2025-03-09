# Burrito Rater Documentation

This directory contains documentation for the Burrito Rater application.

## Available Documentation

### Administration and Development

- [Administration and DevOps Guide](./ADMIN_DEVOPS.md) - Comprehensive guide for deploying, administering, and maintaining the application, including admin setup and DevOps workflows
- [Database Schema](./DATABASE_SCHEMA.md) - Details about the database schema and structure
- [Cloudflare Migration Guide](./CLOUDFLARE_MIGRATION.md) - Details about the migration from SQLite to Cloudflare D1
- [Custom Domain Setup Guide](./CUSTOM_DOMAIN.md) - Step-by-step guide for configuring a custom domain
- [Development Guidelines](../.cursorrules) - Coding standards and development guidelines
- [CAPTCHA Implementation Guide](./CAPTCHA_IMPLEMENTATION.md) - Detailed documentation on the Cloudflare Turnstile CAPTCHA integration
- [API Worker Documentation](./API_WORKER.md) - Information about the Cloudflare Worker API and its endpoints

### Product Management

- [Project Roadmap](./PRODUCT_MGMT/ROADMAP.md) - Future plans and development roadmap
- [Project Checklist](./PRODUCT_MGMT/TODO_CHECKLIST.md) - Completed milestones and upcoming tasks
- [Bug Tracking](./PRODUCT_MGMT/BUGS.md) - Known issues and their status

## Project Overview

Burrito Rater is a web application for discovering and rating burritos. Users can submit ratings for burritos they've tried, view ratings on a map, and browse a list of all ratings. It is built with:

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS (deployed to Cloudflare Pages)
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1
- **Maps**: Google Maps API
- **Security**: Cloudflare Turnstile CAPTCHA

For more information, see the [main README](../README.md) file. 