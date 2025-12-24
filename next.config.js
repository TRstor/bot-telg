/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/index.html',
        },
      ],
    };
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
};

module.exports = nextConfig;
