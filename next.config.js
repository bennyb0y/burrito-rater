/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export since we need server-side functionality
  distDir: 'dist',
  images: {
    domains: ['*'], // Allow images from all domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 