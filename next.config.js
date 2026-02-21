const isGithubPages = process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isGithubPages && repo ? `/${repo}` : "",
  assetPrefix: isGithubPages && repo ? `/${repo}/` : "",
};

module.exports = nextConfig;
