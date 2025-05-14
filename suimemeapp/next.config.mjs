/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["lru-cache", "@mysten/dapp-kit"],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    // Add snapshot.managedPaths for better development experience with Bit components
    config.snapshot = {
      ...(config.snapshot || {}),
      managedPaths: [/^(?!.*[\\/]node_modules[\\/](?:@mysten)[\\/])(.+[\\/]node_modules[\\/])/],
    };
    return config;
  },
  images: {
    domains: ['placeholder.com'], // Add any external image domains here
  }
};

export default nextConfig;
