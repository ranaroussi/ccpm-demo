/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration options
  turbopack: {
    root: process.cwd(),
  },
  eslint: {
    // Disable ESLint during builds (handled separately)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily disable type checking during Docker builds
    ignoreBuildErrors: true,
  },
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // Optimize for production builds
  outputFileTracingRoot: process.cwd(),
  // Compress images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig
