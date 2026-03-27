import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow serving video/image files from the server itself
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ilovedesi.fun',
        pathname: '/videos/**',
      },
    ],
  },

  // Rewrites so /videos/* is served via Nginx on the real server,
  // but proxied in dev (or just left to Nginx in prod)
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
