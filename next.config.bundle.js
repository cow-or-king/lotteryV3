/**
 * Next.js Bundle Analyzer Configuration
 * Utilisé pour analyser la taille du bundle
 * Usage: ANALYZE=true npm run build
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration Next.js existante
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@trpc/client', '@trpc/server'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
