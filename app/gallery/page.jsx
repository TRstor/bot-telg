'use client';

import { useEffect } from 'react';
import GalleryPopup from '@/components/GalleryPopup';

export default function GalleryPage() {
  useEffect(() => {
    // تحميل سكريبت المعرض
    const script = document.createElement('script');
    script.innerHTML = require('./galleryScript.js');
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', padding: '20px' }}>
      <GalleryPopup />
    </div>
  );
}
