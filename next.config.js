/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // إعدادات الصور
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

console.log('🔧 تحميل إعدادات Next.js');
console.log('📦 NODE_ENV:', process.env.NODE_ENV);

module.exports = nextConfig;
