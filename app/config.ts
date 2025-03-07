// Configuration for the application

// API base URL configuration
// Set to empty string to use relative URLs (Next.js API routes)
// Set to Cloudflare Worker URL to use the worker API directly
export const API_BASE_URL: string = '';

// Helper function to get the full API URL
export function getApiUrl(path: string): string {
  // If API_BASE_URL is empty, use relative paths (Next.js API routes)
  if (!API_BASE_URL) {
    return path;
  }
  
  // Otherwise, join the base URL with the path
  // Remove any trailing slash from base URL and leading slash from path
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
  
  const apiPath = path.startsWith('/') 
    ? path 
    : `/${path}`;
  
  return `${baseUrl}${apiPath}`;
} 