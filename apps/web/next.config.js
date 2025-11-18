/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@enatbet/firebase', '@enatbet/shared', '@enatbet/ui', '@enatbet/config'],
  webpack: (config, { isServer }) => {
    // Fix for undici private class fields
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Transpile undici
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/(undici|@firebase)/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
};

module.exports = nextConfig;