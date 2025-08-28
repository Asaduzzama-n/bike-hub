/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // allow any domain over https
      },
      {
        protocol: 'http',
        hostname: '**', // allow any domain over http (optional, if needed)
      },
    ],
  },
  transpilePackages: ['lucide-react'],
};

module.exports = nextConfig;