export const metadata = {
  title: 'معرض الشعبيات - PUBG Gallery',
  description: 'معرض الشعبيات الكامل لشخصيات ومتعلقات لعبة PUBG',
  openGraph: {
    title: 'معرض الشعبيات',
    description: 'تصفح أجمل صور الشعبيات من لعبة PUBG',
    type: 'website',
  },
};

// Logging للتشخيص
if (typeof window === 'undefined') {
  console.log('🚀 تحميل تطبيق معرض الشعبيات');
  console.log('⏰ الوقت:', new Date().toLocaleString('ar-SA'));
  console.log('🌍 البيئة:', process.env.NODE_ENV || 'development');
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* تحذير من أخطاء */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('error', (event) => {
              console.error('❌ خطأ:', event.error);
              console.error('الملف:', event.filename);
              console.error('السطر:', event.lineno);
            });
            
            window.addEventListener('unhandledrejection', (event) => {
              console.error('❌ Promise Error:', event.reason);
            });
            
            console.log('✅ تطبيق معرض الشعبيات جاهز');
            console.log('📍 الصفحة الحالية:', window.location.pathname);
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
