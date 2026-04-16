/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/bang-escape' : '',
  assetPrefix: isProd ? '/bang-escape/' : undefined,
  async rewrites() {
    if (isProd) return [];
    return [
      { source: '/bang-escape', destination: '/' },
      { source: '/bang-escape/:path*', destination: '/:path*' },
    ];
  },
};

export default nextConfig;
