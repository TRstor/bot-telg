import { NextResponse } from 'next/server';

// تخزين مؤقت للصور (يتم تحديثه من server-bot.js)
export let cachedImages = {};

// دالة لتحديث الـ cache من البوت
export function setCachedImages(images) {
  cachedImages = images || {};
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'getImages') {
      return NextResponse.json({
        success: true,
        images: cachedImages,
        count: Object.keys(cachedImages).length
      });
    }

    if (action === 'health') {
      return NextResponse.json({
        success: true,
        botRunning: true,
        imageCount: Object.keys(cachedImages).length
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('❌ خطأ في API:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
