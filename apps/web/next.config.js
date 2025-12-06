/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['undici', 'firebase-admin'],
  experimental: {
    serverComponentsExternalPackages: ['undici', 'firebase-admin'],
  },
}

module.exports = nextConfig
