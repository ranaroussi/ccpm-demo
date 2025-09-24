/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration options
  turbopack: {
    root: process.cwd(),
  },
  eslint: {
    // Disable ESLint during builds (handled separately)
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
