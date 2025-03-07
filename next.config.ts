import type { NextConfig } from "next";

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
  // Only use static export in production
  ...(isDevelopment ? {} : { output: 'export' }),
  images: {
    unoptimized: true, // Required for static site generation
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during production builds
    ignoreBuildErrors: true,
  },
  // Add trailing slashes to ensure proper static file handling
  trailingSlash: true,
  // Ensure proper handling of client-side pages
  webpack: (config, { isServer }) => {
    // Add a rule to handle client-side pages
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: [/app\/admin/],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });
    return config;
  },
};

export default nextConfig;
