# Burrito Rater Documentation

This directory contains documentation for the Burrito Rater application.

## Available Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Instructions for deploying the application
- [Development Guide](./DEVELOPMENT.md) - Guide for setting up and using the development environment
- [Admin Interface Guide](./ADMIN_GUIDE.md) - Guide for using the admin interface
- [Database Schema](./DATABASE_SCHEMA.md) - Details about the database schema and structure
- [Cloudflare Migration Guide](./CLOUDFLARE_MIGRATION.md) - Details about the migration from SQLite to Cloudflare D1
- [Cloudflare Pages Deployment Guide](./CLOUDFLARE_PAGES.md) - Guide for deploying the frontend to Cloudflare Pages
- [Admin Setup Guide](./ADMIN_SETUP.md) - Instructions for setting up and securing the admin section
- [Custom Domain Setup Guide](./CUSTOM_DOMAIN.md) - Step-by-step guide for configuring a custom domain
- [Development Guidelines](./CURSOR_RULES.md) - Coding standards and development guidelines
- [Project Checklist](./TODO_CHECKLIST.md) - Completed milestones and upcoming tasks
- [Development Workflow Guide](./WORKFLOW.md) - Complete CI/CD workflow from development to deployment
- [DevOps Workflow Guide](./WORKFLOW_DEVOPS.md) - Comprehensive guide to the application architecture and operational processes from a DevOps perspective
- [CAPTCHA Implementation Guide](./CAPTCHA_IMPLEMENTATION.md) - Detailed documentation on the Cloudflare Turnstile CAPTCHA integration
- [API Worker Documentation](./API_WORKER.md) - Information about the Cloudflare Worker API and its endpoints

## Project Overview

Burrito Rater is a web application for discovering and rating burritos. Users can submit ratings for burritos they've tried, view ratings on a map, and browse a list of all ratings. It is built with:

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS (deployed to Cloudflare Pages)
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1
- **Maps**: Google Maps API
- **Security**: Cloudflare Turnstile CAPTCHA

For more information, see the [main README](../README.md) file. 