/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@tracker/types", "@tracker/ui"],
};

module.exports = nextConfig;
