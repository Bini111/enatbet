/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@enatbet/firebase', '@enatbet/shared', '@enatbet/ui', '@enatbet/config'],
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'firebase-admin', '@firebase/auth'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle Firebase packages for server
      config.externals.push({
        'firebase': 'commonjs firebase',
        'firebase-admin': 'commonjs firebase-admin',
        '@firebase/auth': 'commonjs @firebase/auth',
        'undici': 'commonjs undici',
      });
    }
    return config;
  },
};

module.exports = nextConfig;