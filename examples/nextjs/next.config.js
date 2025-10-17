/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@btc-connect/react', '@btc-connect/ui', '@btc-connect/core'],
  webpack: (config) => {
    // Support for Web Components
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
};

export default nextConfig;