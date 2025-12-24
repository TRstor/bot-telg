/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // تحسين الأداء
  compress: true,
  poweredByHeader: false,
  
  // معالجة الأخطاء
  onError: (error) => {
    console.error('❌ خطأ في البناء:', error);
  },
  
  // logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
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
