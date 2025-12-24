// 🔥 Firebase Firestore Setup
const admin = require('firebase-admin');

let db = null;
let isInitialized = false;

// تهيئة Firebase
function initializeFirebase() {
  if (isInitialized && db) {
    return db;
  }

  try {
    const credentialsJson = process.env.FIREBASE_CREDENTIALS;
    
    if (!credentialsJson) {
      console.warn('⚠️ FIREBASE_CREDENTIALS غير موجود - سيتم استخدام الملفات المحلية فقط');
      return null;
    }

    const credentials = JSON.parse(credentialsJson);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
      console.log('✅ Firebase مهيأ بنجاح');
    }

    db = admin.firestore();
    isInitialized = true;
    
    return db;
  } catch (err) {
    console.error('❌ خطأ في تهيئة Firebase:', err.message);
    return null;
  }
}

// تحميل البيانات من Firestore
async function getImagesFromFirestore() {
  const db = initializeFirebase();
  
  if (!db) {
    console.warn('⚠️ Firestore غير متاح');
    return {};
  }

  try {
    const snapshot = await db.collection('images').get();
    const images = {};
    let count = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.url) {
        images[data.url] = {
          name: data.name || 'بدون اسم',
          keywords: data.keywords || [],
        };
        count++;
      }
    });

    console.log('✅ تم تحميل', count, 'صورة من Firestore');
    return images;
  } catch (err) {
    console.error('❌ خطأ في جلب الصور:', err.message);
    return {};
  }
}

// إضافة صورة إلى Firestore
async function addImageToFirestore(url, name, keywords = []) {
  const db = initializeFirebase();
  
  if (!db) {
    console.warn('⚠️ Firestore غير متاح');
    return false;
  }

  try {
    await db.collection('images').add({
      url,
      name,
      keywords,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ تمت إضافة صورة:', name);
    return true;
  } catch (err) {
    console.error('❌ خطأ في إضافة صورة:', err.message);
    return false;
  }
}

// تحديث صورة في Firestore
async function updateImageInFirestore(url, updates) {
  const db = initializeFirebase();
  
  if (!db) return false;

  try {
    const snapshot = await db.collection('images').where('url', '==', url).get();
    
    if (snapshot.empty) {
      console.warn('⚠️ الصورة غير موجودة');
      return false;
    }

    const docId = snapshot.docs[0].id;
    await db.collection('images').doc(docId).update({
      ...updates,
      updatedAt: new Date(),
    });

    console.log('✅ تم تحديث الصورة');
    return true;
  } catch (err) {
    console.error('❌ خطأ في تحديث الصورة:', err.message);
    return false;
  }
}

// حذف صورة من Firestore
async function deleteImageFromFirestore(url) {
  const db = initializeFirebase();
  
  if (!db) return false;

  try {
    const snapshot = await db.collection('images').where('url', '==', url).get();
    
    if (snapshot.empty) {
      console.warn('⚠️ الصورة غير موجودة');
      return false;
    }

    const docId = snapshot.docs[0].id;
    await db.collection('images').doc(docId).delete();

    console.log('✅ تم حذف الصورة');
    return true;
  } catch (err) {
    console.error('❌ خطأ في حذف الصورة:', err.message);
    return false;
  }
}

// نقل البيانات من gallery-data.js إلى Firestore (مرة واحدة)
async function migrateDataToFirestore(imageData) {
  const db = initializeFirebase();
  
  if (!db) {
    console.warn('⚠️ Firestore غير متاح - تخطي الهجرة');
    return false;
  }

  try {
    // التحقق من عدد البيانات الحالية
    const snapshot = await db.collection('images').get();
    const currentCount = snapshot.size;
    const expectedCount = Object.keys(imageData).length;
    
    console.log(`📊 عدد الصور الحالية: ${currentCount}, المتوقع: ${expectedCount}`);
    
    // إذا كان العدد قريب من المتوقع، تخطي
    if (currentCount > expectedCount * 0.8) {
      console.log('✅ البيانات موجودة بالفعل في Firestore - تخطي الهجرة');
      return true;
    }

    // حذف البيانات القديمة
    if (currentCount > 0) {
      console.log('🗑️ حذف البيانات القديمة...');
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ تم حذف البيانات القديمة');
    }

    console.log('🔄 بدء نقل البيانات إلى Firestore...');
    let count = 0;
    let errors = 0;
    const batch = db.batch();

    for (const [url, meta] of Object.entries(imageData)) {
      try {
        const docRef = db.collection('images').doc();
        batch.set(docRef, {
          url,
          name: meta.name || 'بدون اسم',
          keywords: meta.keywords || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        count++;
        
        // إرسال كل 100 صورة
        if (count % 100 === 0) {
          await batch.commit();
          console.log(`🔄 تم نقل ${count} صورة...`);
        }
      } catch (itemErr) {
        errors++;
        console.warn(`⚠️ خطأ في نقل صورة: ${itemErr.message}`);
      }
    }

    // إرسال الباقي
    if (count % 100 !== 0) {
      await batch.commit();
    }

    console.log(`✅ تم نقل ${count} صورة إلى Firestore (${errors} أخطاء)`);
    return count > 0;
  } catch (err) {
    console.error('❌ خطأ في نقل البيانات:', err.message);
    return false;
  }
}

module.exports = {
  initializeFirebase,
  getImagesFromFirestore,
  addImageToFirestore,
  updateImageInFirestore,
  deleteImageFromFirestore,
  migrateDataToFirestore,
};
