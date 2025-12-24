const admin = require('firebase-admin');
const fs = require('fs');

async function checkFirestore() {
  try {
    const credentialsJson = process.env.FIREBASE_CREDENTIALS;
    if (!credentialsJson) {
      console.log('❌ FIREBASE_CREDENTIALS غير موجود');
      return;
    }

    const credentials = JSON.parse(credentialsJson);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    }

    const db = admin.firestore();
    const snapshot = await db.collection('images').get();
    
    console.log('\n📊 إحصائيات Firestore:');
    console.log('========================');
    console.log(`✅ عدد الصور الكلي: ${snapshot.size}`);
    
    // عد الصور التي لها storageUrl
    let withStorage = 0;
    let withoutStorage = 0;
    
    snapshot.forEach((doc) => {
      if (doc.data().storageUrl) {
        withStorage++;
      } else {
        withoutStorage++;
      }
    });
    
    console.log(`📤 صور مع Firebase Storage: ${withStorage}`);
    console.log(`📎 صور بدون Firebase Storage (ibb.co): ${withoutStorage}`);
    console.log(`📈 نسبة النقل: ${((withStorage / snapshot.size) * 100).toFixed(1)}%`);
    console.log('========================\n');
    
  } catch (err) {
    console.error('❌ خطأ:', err.message);
  }
  process.exit(0);
}

checkFirestore();
