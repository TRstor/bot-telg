export const metadata = {
  title: 'معرض الشعبيات - PUBG Gallery',
  description: 'معرض الشعبيات الكامل لشخصيات ومتعلقات لعبة PUBG',
  openGraph: {
    title: 'معرض الشعبيات',
    description: 'تصفح أجمل صور الشعبيات من لعبة PUBG',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
