/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/bang-escape',
  assetPrefix: '/bang-escape/',
};

export default nextConfig;
