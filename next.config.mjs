/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep firebase-admin and other server-only packages out of client bundles
  serverExternalPackages: ['firebase-admin'],

  // Disable X-Powered-By header (security + smaller response)
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  images: {
    // Serve modern image formats — AVIF is 30-50% smaller than WebP
    formats: ['image/avif', 'image/webp'],

    // Cache optimized images for 1 hour (reduces re-processing)
    minimumCacheTTL: 3600,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.edgestore.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
      },
      // Cache static assets aggressively
      {
        source: '/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      // Cache API responses for paintings
      {
        source: '/api/paintings',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=30, stale-while-revalidate=60'
          }
        ],
      },
    ];
  },
};

export default nextConfig;

