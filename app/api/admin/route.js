import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// التحقق من Firebase
function getDb() {
  if (!admin.apps.length) {
    const credentialsJson = process.env.FIREBASE_CREDENTIALS;
    if (!credentialsJson) return null;
    
    try {
      const credentials = JSON.parse(credentialsJson);
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    } catch (err) {
      console.error('Firebase init error:', err);
      return null;
    }
  }
  return admin.firestore();
}

// API endpoint للإحصائيات
export async function POST(request) {
  try {
    const { action, password } = await request.json();
    
    // التحقق من كلمة المرور
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { error: 'كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'خطأ في قاعدة البيانات' },
        { status: 500 }
      );
    }

    // إجراءات مختلفة
    switch (action) {
      case 'stats': {
        // الإحصائيات الرئيسية
        const imagesSnapshot = await db.collection('images').get();
        const usersSnapshot = await db.collection('users').get();
        const favoritesSnapshot = await db.collection('favorites').get();
        const activitiesSnapshot = await db.collection('activities').limit(50).orderBy('timestamp', 'desc').get();

        // أكثر صور مشهورة
        const statsSnapshot = await db.collection('statistics').orderBy('viewCount', 'desc').limit(10).get();
        const topImages = [];
        statsSnapshot.forEach(doc => {
          topImages.push({
            imageUrl: doc.data().imageUrl,
            viewCount: doc.data().viewCount,
            favoriteCount: doc.data().favoriteCount,
          });
        });

        return NextResponse.json({
          totalImages: imagesSnapshot.size,
          totalUsers: usersSnapshot.size,
          totalFavorites: favoritesSnapshot.size,
          topImages,
        });
      }

      case 'activities': {
        // آخر النشاطات
        const activitiesSnapshot = await db.collection('activities').limit(100).orderBy('timestamp', 'desc').get();
        const activities = [];
        activitiesSnapshot.forEach(doc => {
          const data = doc.data();
          activities.push({
            userId: data.userId,
            action: data.action,
            details: data.details,
            timestamp: data.timestamp?.toDate().toISOString(),
          });
        });
        return NextResponse.json({ activities });
      }

      case 'searches': {
        // أكثر عمليات بحث
        const searchesSnapshot = await db.collection('searches').get();
        const searchMap = {};
        searchesSnapshot.forEach(doc => {
          const data = doc.data();
          const query = data.searchQuery;
          searchMap[query] = (searchMap[query] || 0) + 1;
        });

        const topSearches = Object.entries(searchMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([query, count]) => ({ query, count }));

        return NextResponse.json({ topSearches });
      }

      case 'users': {
        // بيانات المستخدمين
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          users.push({
            userId: data.userId,
            username: data.username,
            lastActive: data.lastActive?.toDate().toISOString(),
          });
        });

        // عدد المفضلات لكل مستخدم
        const favoritesSnapshot = await db.collection('favorites').get();
        const favMap = {};
        favoritesSnapshot.forEach(doc => {
          const userId = doc.data().userId;
          favMap[userId] = (favMap[userId] || 0) + 1;
        });

        users.forEach(user => {
          user.favoriteCount = favMap[user.userId] || 0;
        });

        return NextResponse.json({ users });
      }

      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json(
      { error: 'خطأ في الخادم: ' + err.message },
      { status: 500 }
    );
  }
}
