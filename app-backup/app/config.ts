// Configuration for the application

// API base URL configuration
// Use the Cloudflare Worker URL for both development and production
export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-worker-name.your-account.workers.dev';

// Helper function to get the full API URL
export function getApiUrl(path: string): string {
  // Join the base URL with the path
  // Remove any trailing slash from base URL and leading slash from path
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
  
  // Add /api/ prefix if not already present
  let apiPath = path;
  if (!path.startsWith('/api/') && !path.startsWith('api/')) {
    apiPath = `api/${path}`;
  } else if (path.startsWith('/')) {
    apiPath = path.slice(1);
  }
  
  return `${baseUrl}/${apiPath}`;
} 