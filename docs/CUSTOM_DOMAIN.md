# Custom Domain Setup Guide

This document provides step-by-step instructions for setting up a custom domain for the Burrito Rater application on Cloudflare.

## Prerequisites

- A registered domain name
- Access to your domain's DNS settings
- Cloudflare account with the Burrito Rater project set up

## Step 1: Add Your Domain to Cloudflare

1. Log in to your Cloudflare account: https://dash.cloudflare.com/
2. Click on "Add a Site" on the dashboard
3. Enter your domain name and click "Add Site"
4. Select a plan (Free plan is sufficient for most needs)
5. Follow the instructions to update your domain's nameservers at your registrar
   - This typically involves replacing your registrar's nameservers with Cloudflare's nameservers
   - The exact nameservers will be provided by Cloudflare during setup
6. Wait for the DNS changes to propagate (can take up to 24 hours)

## Step 2: Configure Custom Domain for Cloudflare Pages

1. Log in to your Cloudflare account
2. Navigate to "Workers & Pages"
3. Select your Burrito Rater Pages project
4. Go to the "Custom domains" tab
5. Click "Set up a custom domain"
6. Enter your domain or subdomain (e.g., `burrito-rater.com` or `app.burrito-rater.com`)
7. Click "Continue"
8. Cloudflare will automatically configure the necessary DNS records
9. Click "Activate domain"

## Step 3: Configure Custom Domain for Cloudflare Worker API

If you want to use a subdomain for your API (recommended):

1. Log in to your Cloudflare account
2. Navigate to "Workers & Pages"
3. Select your Burrito Rater Worker
4. Go to the "Triggers" tab
5. Under "Custom Domains", click "Add Custom Domain"
6. Enter your API subdomain (e.g., `api.burrito-rater.com`)
7. Click "Add"

## Step 4: Update Environment Variables

After setting up your custom domains, you need to update the environment variables:

1. Navigate to "Workers & Pages" > Your Pages project > "Settings" > "Environment variables"
2. Update the `NEXT_PUBLIC_API_BASE_URL` to use your custom API domain:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.burrito-rater.com
   ```
3. Save the changes
4. Trigger a new deployment

## Step 5: Verify SSL Configuration

Cloudflare automatically provisions SSL certificates for your domains. To verify:

1. Go to your domain's overview page in Cloudflare
2. Navigate to "SSL/TLS"
3. Ensure that SSL is set to "Full" or "Full (Strict)"
4. Check that the certificate is active

## Step 6: Test Your Custom Domain

1. Visit your custom domain in a browser (e.g., `https://burrito-rater.com`)
2. Verify that the application loads correctly
3. Test the API functionality to ensure it's working with the new domain
4. Check for any console errors related to API calls or CORS issues

## Troubleshooting

### DNS Issues

If your domain isn't resolving:
- Verify that your nameservers are correctly set at your registrar
- Check the DNS records in Cloudflare to ensure they're correctly configured
- Use a tool like `dig` or `nslookup` to check DNS propagation

### SSL Issues

If you're seeing SSL errors:
- Ensure that Cloudflare has provisioned an SSL certificate for your domain
- Check that the SSL mode is set to "Full" or "Full (Strict)"
- Wait a few minutes for the certificate to be fully provisioned

### API Connection Issues

If the frontend can't connect to the API:
- Verify that the `NEXT_PUBLIC_API_BASE_URL` is correctly set
- Check for CORS issues in the browser console
- Ensure that the Worker is correctly configured to handle requests from your custom domain

## Best Practices

1. **Use Subdomains**: Use separate subdomains for your frontend and API (e.g., `app.burrito-rater.com` and `api.burrito-rater.com`)
2. **Enable HTTPS**: Always use HTTPS for all domains and subdomains
3. **Set Up Redirects**: Configure redirects from `www` to non-`www` (or vice versa) for consistency
4. **Monitor Performance**: Use Cloudflare Analytics to monitor your domain's performance
5. **Regular Backups**: Regularly back up your DNS configuration 