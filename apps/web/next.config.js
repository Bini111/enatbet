/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@enatbet/shared', '@enatbet/firebase', '@enatbet/ui'],
};

module.exports = nextConfig;
