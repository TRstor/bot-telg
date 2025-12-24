'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // استيراد GalleryScript مباشرة في الصفحة الرئيسية
    import('../components/GalleryScript.js').then(({ default: GalleryScript }) => {
      GalleryScript();
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      padding: '20px'
    }}>
      <div id="gallery-container" />
    </div>
  );
}
