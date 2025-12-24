'use client';

import { useEffect } from 'react';

export default function GalleryPage() {
  useEffect(() => {
    // استيراد GalleryScript
    import('../../components/GalleryScript.js').then(({ default: GalleryScript }) => {
      GalleryScript();
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', padding: '20px' }}>
      <div id="gallery-container" />
    </div>
  );
}
