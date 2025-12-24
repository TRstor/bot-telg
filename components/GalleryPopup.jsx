'use client';

import { useEffect, useState } from 'react';
import GalleryScript from './GalleryScript';

export default function GalleryPopup() {
  useEffect(() => {
    GalleryScript();
  }, []);

  return <></>;
}
