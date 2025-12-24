// 🔥 Firebase Firestore + Storage Setup
const admin = require('firebase-admin');
const fetch = require('node-fetch');

let db = null;
let storage = null;
let isInitialized = false;

// تهيئة Firebase
function initializeFirebase() {
  if (isInitialized && db) {
    return { db, storage };
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
        storageBucket: credentials.storageBucket || 'bot-telg-gallery.appspot.com',
      });
      console.log('✅ Firebase مهيأ بنجاح (Firestore + Storage)');
    }

    db = admin.firestore();
    storage = admin.storage().bucket();
    isInitialized = true;
    
    return { db, storage };
  } catch (err) {
    console.error('❌ خطأ في تهيئة Firebase:', err.message);
    return null;
  }
}

// تحميل البيانات من Firestore
async function getImagesFromFirestore() {
  const result = initializeFirebase();
  
  if (!result || !result.db) {
    console.warn('⚠️ Firestore غير متاح');
    return {};
  }

  const db = result.db;

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
          storageUrl: data.storageUrl || null,
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
  const result = initializeFirebase();
  
  if (!result || !result.db) {
    console.warn('⚠️ Firestore غير متاح');
    return false;
  }

  const db = result.db;

  try {
    await db.collection('images').add({
      url,
      name,
      keywords,
      storageUrl: null,
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
  const result = initializeFirebase();
  
  if (!result || !result.db) return false;

  const db = result.db;

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

// حذف صورة من Firestore و Storage
async function deleteImageFromFirestore(url) {
  const result = initializeFirebase();
  
  if (!result || !result.db) return false;

  const db = result.db;

  try {
    const snapshot = await db.collection('images').where('url', '==', url).get();
    
    if (snapshot.empty) {
      console.warn('⚠️ الصورة غير موجودة');
      return false;
    }

    const docId = snapshot.docs[0].id;
    const data = snapshot.docs[0].data();
    
    // حذف من Storage إذا كانت موجودة هناك
    if (data.storageUrl && result.storage) {
      try {
        const fileName = data.storageUrl.split('/').pop().split('?')[0];
        await result.storage.file(`images/${fileName}`).delete();
        console.log('✅ تم حذف الصورة من Storage');
      } catch (storageErr) {
        console.warn('⚠️ لم نتمكن من حذف من Storage:', storageErr.message);
      }
    }
    
    await db.collection('images').doc(docId).delete();

    console.log('✅ تم حذف الصورة');
    return true;
  } catch (err) {
    console.error('❌ خطأ في حذف الصورة:', err.message);
    return false;
  }
}

// تحميل صورة من URL وحفظها في Firebase Storage
async function uploadImageToStorage(imageUrl, fileName) {
  const result = initializeFirebase();
  
  if (!result || !result.storage) {
    console.warn('⚠️ Firebase Storage غير متاح');
    return null;
  }

  try {
    // تحميل الصورة من الرابط الخارجي
    const response = await fetch(imageUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)',
      },
    });
    
    if (!response.ok) {
      console.warn(`⚠️ فشل تحميل الصورة من ${imageUrl}: ${response.status}`);
      return null;
    }

    const buffer = await response.buffer();
    const filePath = `images/${Date.now()}-${fileName}`;
    const file = result.storage.file(filePath);

    // حفظ الصورة
    await file.save(buffer, {
      metadata: {
        contentType: response.headers.get('content-type') || 'image/jpeg',
      },
    });

    // الحصول على رابط الوصول العام (مع انتهاء الصلاحية)
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // سنة واحدة
    });

    console.log(`✅ تم تحميل الصورة إلى Storage: ${fileName}`);
    return signedUrl;
  } catch (err) {
    console.error(`❌ خطأ في تحميل الصورة: ${err.message}`);
    return null;
  }
}

// نقل الصور من ibb.co إلى Firebase Storage
async function migrateToFirebaseStorage(imageData) {
  const result = initializeFirebase();
  
  if (!result || !result.db) {
    console.warn('⚠️ Firebase غير متاح - تخطي الهجرة');
    return false;
  }

  const db = result.db;

  try {
    console.log('🔄 بدء نقل الصور إلى Firebase Storage...');
    let count = 0;
    let skipped = 0;
    let errors = 0;

    for (const [ibbUrl, meta] of Object.entries(imageData)) {
      try {
        // التحقق من وجود الصورة بالفعل في Storage
        const existingSnapshot = await db.collection('images')
          .where('url', '==', ibbUrl)
          .get();

        if (!existingSnapshot.empty) {
          const existingData = existingSnapshot.docs[0].data();
          if (existingData.storageUrl) {
            skipped++;
            continue; // موجودة بالفعل في Storage
          }

          // تحديث الصورة الموجودة برابط Storage الجديد
          const storageUrl = await uploadImageToStorage(ibbUrl, `${Date.now()}-${count}.jpg`);
          
          if (storageUrl) {
            await db.collection('images').doc(existingSnapshot.docs[0].id).update({
              storageUrl,
              updatedAt: new Date(),
            });
            count++;
            
            if (count % 50 === 0) {
              console.log(`🔄 تم تحديث ${count} صورة...`);
            }
          } else {
            errors++;
          }
        }
      } catch (itemErr) {
        errors++;
        if (errors <= 3) {
          console.warn(`⚠️ خطأ في معالجة صورة: ${itemErr.message}`);
        }
      }
    }

    console.log(`✅ تم نقل ${count} صورة إلى Firebase Storage (تخطي: ${skipped}, أخطاء: ${errors})`);
    return count > 0;
  } catch (err) {
    console.error('❌ خطأ في نقل الصور إلى Storage:', err.message);
    return false;
  }
}

// نقل البيانات من gallery-data.js إلى Firestore (مرة واحدة)
async function migrateDataToFirestore(imageData) {
  const result = initializeFirebase();
  
  if (!result || !result.db) {
    console.warn('⚠️ Firestore غير متاح - تخطي الهجرة');
    return false;
  }

  const db = result.db;

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
    const errorUrls = [];

    for (const [url, meta] of Object.entries(imageData)) {
      try {
        if (!url || !meta || !meta.name) {
          errors++;
          errorUrls.push(`URL: ${url}, Meta: ${JSON.stringify(meta)}`);
          continue;
        }

        await db.collection('images').add({
          url: String(url),
          name: String(meta.name || 'بدون اسم'),
          keywords: Array.isArray(meta.keywords) ? meta.keywords : [],
          storageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        count++;
        
        // اطبع تقدم كل 50 صورة
        if (count % 50 === 0) {
          console.log(`🔄 تم نقل ${count} صورة...`);
        }
      } catch (itemErr) {
        errors++;
        if (errors <= 5) {
          console.warn(`⚠️ خطأ في نقل صورة: ${itemErr.message}`);
        }
      }
    }

    console.log(`✅ تم نقل ${count} صورة إلى Firestore (${errors} أخطاء)`);
    
    if (errorUrls.length > 0 && errorUrls.length <= 5) {
      console.log('🔍 أول 5 أخطاء:', errorUrls);
    }
    
    return count > 50; // نعتبر النقل ناجح إذا نقلنا أكثر من 50 صورة
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
  uploadImageToStorage,
  migrateDataToFirestore,
  migrateToFirebaseStorage,
};
