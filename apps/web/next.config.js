/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ["@tracker/types", "@tracker/ui"],
};

module.exports = nextConfig;
