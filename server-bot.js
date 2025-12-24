// ⚡ ملف تشغيل البوت في الخادم (يعمل مرة واحدة عند البدء)
// هذا الملف يشغل polling البوت في الخلفية مع خادم Next.js

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { 
  getImagesFromFirestore, 
  migrateDataToFirestore, 
  addImageToFirestore,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  saveUserData,
  logSearch,
  logActivity,
  updateImageStatistics
} = require('./lib/firebase');

let bot = null;
let isStarting = false;
let IMAGE_META = {};

// 🔄 نظام حفظ حالة المستخدمين (user states for image upload)
const userStates = {};

// تحميل بيانات الصور من الملف
function loadImageDataLocal() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'gallery-data.js');
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      const metaMatch = fileContent.match(/const\s+IMAGE_META\s*=\s*(\{[\s\S]*?\});/);
      if (metaMatch) {
        try {
          IMAGE_META = eval('(' + metaMatch[1] + ')');
          console.log('✅ تم تحميل (محلي):', Object.keys(IMAGE_META).length, 'صورة');
          return IMAGE_META;
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل البيانات:', e.message);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ لم يتمكن من تحميل بيانات الصور المحلية:', err.message);
  }
  return {};
}

// تحميل البيانات من Firestore أولاً، وإلا من الملف
async function loadImageData() {
  try {
    // محاولة تحميل من Firestore أولاً (الأولوية)
    console.log('📤 محاولة تحميل البيانات من Firestore...');
    const firestoreData = await getImagesFromFirestore();
    
    if (Object.keys(firestoreData).length > 100) {
      console.log('✅ تم التحميل من Firestore بنجاح');
      IMAGE_META = firestoreData;
      return true;
    }
    
    // إذا Firestore فارغ أو فاشل → تحميل من المحلي كـ fallback
    console.warn('⚠️ Firestore فارغ أو غير متاح - تحميل من الملف المحلي...');
    const localData = loadImageDataLocal();
    
    if (Object.keys(localData).length === 0) {
      console.warn('⚠️ لم يتمكن من تحميل البيانات');
      return false;
    }

    IMAGE_META = localData;
    
    // محاولة نقل إلى Firestore
    console.log('📤 محاولة نقل البيانات إلى Firestore...');
    const migrated = await migrateDataToFirestore(localData);
    
    return Object.keys(IMAGE_META).length > 0;
  } catch (err) {
    console.warn('⚠️ خطأ في تحميل البيانات:', err.message);
    // fallback نهائي للملف المحلي
    IMAGE_META = loadImageDataLocal();
    return Object.keys(IMAGE_META).length > 0;
  }
}

async function startBotPolling() {
  // منع التشغيل المتعدد
  if (bot || isStarting) {
    console.log('✅ البوت يعمل بالفعل - تخطي إعادة البدء');
    return;
  }

  isStarting = true;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN غير موجود - البوت غير مفعل');
    isStarting = false;
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('✅ بدء polling البوت...');

    // تحميل بيانات الصور
    await loadImageData();

    // 📨 معالجة الرسائل
    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text || '';
      const GALLERY_URL = process.env.RENDER_EXTERNAL_URL || 'https://bot-tel-4p2k.onrender.com';

      try {
        if (text === '/start') {
          await bot.sendMessage(chatId, 
            '🎮 مرحباً في معرض شعبيات PUBG!\n\n' +
            'اختر ما تريد:',
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📱 فتح المعرض', url: GALLERY_URL }],
                  [{ text: '📖 المساعدة', callback_data: 'help' }],
                ],
              },
            }
          );
        } else if (text === '/gallery') {
          await bot.sendMessage(chatId, '📸 فتح المعرض:', {
            reply_markup: {
              inline_keyboard: [[{ text: '📱 اذهب للمعرض', url: GALLERY_URL }]],
            },
          });
        } else if (text === '/categories') {
          await bot.sendMessage(chatId, '🎯 اختر الفئة:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '📺 الكل', callback_data: 'cat_all' }],
                [{ text: '🇰🇷 الكورية', callback_data: 'cat_korea' }],
                [{ text: '🏠 المنزل', callback_data: 'cat_home' }],
                [{ text: '❤️ المفضلة', callback_data: 'cat_fav' }],
              ],
            },
          });
        } else if (text === '/help') {
          await bot.sendMessage(chatId, 
            'ℹ️ كيفية الاستخدام:\n\n' +
            '🔍 اكتب اسم الصورة للبحث\n' +
            '/gallery - فتح المعرض\n' +
            '/categories - الفئات\n' +
            '/favorites - الصور المفضلة\n' +
            '/addimage - إضافة صورة جديدة\n' +
            '/start - القائمة الرئيسية'
          );
        } else if (text === '/favorites') {
          // عرض الصور المفضلة
          const userId = msg.from.id;
          const favorites = await getFavorites(userId);
          
          if (favorites.length === 0) {
            await bot.sendMessage(chatId, 
              '❤️ لا توجد صور مفضلة حتى الآن\n\n' +
              'ابدأ بالبحث والضغط على ❤️ لإضافة صور'
            );
          } else {
            let message = `❤️ المفضلة (${favorites.length}):\n\n`;
            favorites.slice(0, 10).forEach((fav, index) => {
              message += `${index + 1}. ${fav.imageName}\n`;
            });
            
            if (favorites.length > 10) {
              message += `\n... و${favorites.length - 10} أخرى`;
            }
            
            await bot.sendMessage(chatId, message);
          }
        } else if (text === '/addimage') {
          // بدء عملية إضافة صورة جديدة
          userStates[chatId] = {
            step: 1,
            imageUrl: null,
            name: '',
            category: ''
          };
          
          await bot.sendMessage(chatId,
            '🖼️ الخطوة 1/3\n\n' +
            'أرسل رابط الصورة (URL)\n' +
            'مثال: https://i.ibb.co/abc123/image.jpg\n\n' +
            'لإلغاء العملية: /cancel',
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '❌ إلغاء', callback_data: 'cancel_add' }]
                ]
              }
            }
          );
        } else if (text === '/cancel') {
          // إلغاء العملية
          if (userStates[chatId]) {
            delete userStates[chatId];
            await bot.sendMessage(chatId, '❌ تم إلغاء العملية');
          } else {
            await bot.sendMessage(chatId, '⚠️ لا توجد عملية جارية');
          }
        } else if (!text.startsWith('/') && text.trim()) {
          // التحقق من حالة المستخدم - هل هو في خطوة إضافة رابط الصورة؟
          if (userStates[chatId]?.step === 1) {
            // التحقق من أن النص هو رابط URL صحيح
            try {
              new URL(text);
              userStates[chatId].imageUrl = text;
              userStates[chatId].step = 2;
              
              await bot.sendMessage(chatId,
                '📝 الخطوة 2/3\n\n' +
                'أرسل اسم الصورة (الاسم الذي سيظهر في البحث)',
                {
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: '❌ إلغاء', callback_data: 'cancel_add' }]
                    ]
                  }
                }
              );
              return;
            } catch (err) {
              await bot.sendMessage(chatId, '❌ الرجاء إرسال رابط صحيح يبدأ بـ https://\nمثال: https://i.ibb.co/abc123/image.jpg');
              return;
            }
          }
          
          // التحقق من حالة المستخدم - هل هو في خطوة إضافة اسم الصورة؟
          if (userStates[chatId]?.step === 2) {
            userStates[chatId].name = text;
            userStates[chatId].step = 3;
            
            // طلب اختيار الفئة
            await bot.sendMessage(chatId,
              '🎯 الخطوة 3/3\n\n' +
              'اختر فئة الصورة:',
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🇰🇷 كوري', callback_data: 'addimg_korea' }],
                    [{ text: '🌍 عالمي', callback_data: 'addimg_all' }],
                    [{ text: '🏠 المنزل', callback_data: 'addimg_home' }],
                    [{ text: '❌ إلغاء', callback_data: 'cancel_add' }]
                  ]
                }
              }
            );
            return;
          }
          
          // البحث عن الصور (إذا لم يكن المستخدم في عملية إضافة)
          if (userStates[chatId]) {
            await bot.sendMessage(chatId, '⚠️ أنت في عملية إضافة صورة. اكتب اسم الصورة أو /cancel');
            return;
          }
          
          const normalizeText = (str) => {
            return (str || '')
              .trim()
              .toLowerCase()
              .replace(/[ـَُِّْ]/g, '') // حذف التشكيل
              .replace(/ة/g, 'ه')        // تحويل ة إلى ه
              .replace(/ي/g, 'ي')        // توحيد الياء
              .replace(/\s+/g, ' ');     // توحيد المسافات
          };

          const searchNorm = normalizeText(text);
          const results = [];

          // البحث في جميع الصور
          for (const [url, meta] of Object.entries(IMAGE_META)) {
            const name = (meta.name || '');
            const nameNorm = normalizeText(name);
            
            // البحث بالكلمات الجزئية
            if (nameNorm.includes(searchNorm) || searchNorm.includes(nameNorm)) {
              results.push({ url, name });
            }
          }

          console.log(`🔍 بحث عن "${text}" -> نتائج: ${results.length}`);
          
          // تسجيل البحث في Firestore
          const userId = msg.from.id;
          await logSearch(userId, text, results.length);

          if (results.length === 0) {
            await bot.sendMessage(chatId, `❌ لم أجد صور باسم "${text}"\n\nجرب: سونيك أو Marine أو Dragon`);
          } else {
            // إرسال صورة واحدة فقط
            const img = results[0];
            try {
              // تحديث الإحصائيات
              await updateImageStatistics(img.url, 'view');
              
              await bot.sendPhoto(chatId, img.url, { 
                caption: `📸 ${img.name}`,
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '❤️ مفضلة', callback_data: `fav_${encodeURIComponent(img.url)}_${encodeURIComponent(img.name)}` }
                    ]
                  ]
                }
              });
            } catch (err) {
              console.error(`❌ خطأ في إرسال صورة: ${err.message}`);
            }
            
            if (results.length > 1) {
              await bot.sendMessage(chatId, `✅ وجدت ${results.length} نتائج - تم عرض الأولى`);
            }
          }
        }
      } catch (err) {
        console.error('❌ خطأ:', err.message);
        await bot.sendMessage(chatId, '❌ حدث خطأ').catch(() => {});
      }
    });

    // 🔘 معالجة الأزرار
    bot.on('callback_query', async (query) => {
      const { id, data, from } = query;
      const chatId = from.id;

      try {
        await bot.answerCallbackQuery(id);

        if (data === 'help') {
          await bot.sendMessage(chatId, '📖 المساعدة:\n\n🔍 اكتب اسم الصورة\n/gallery - المعرض\n/categories - الفئات\n/favorites - المفضلة\n/addimage - إضافة صورة');
        } else if (data.startsWith('fav_')) {
          // إضافة/حذف من المفضلات
          const parts = data.split('_').slice(1);
          const imageUrl = decodeURIComponent(parts[0]);
          const imageName = decodeURIComponent(parts.slice(1).join('_'));
          const userId = from.id;
          
          try {
            // التحقق من وجودها بالفعل
            const favorites = await getFavorites(userId);
            const isFavorited = favorites.some(f => f.imageUrl === imageUrl);
            
            if (isFavorited) {
              await removeFromFavorites(userId, imageUrl);
              await bot.answerCallbackQuery(id, { text: '💔 تمت الإزالة من المفضلات', show_alert: false });
              await updateImageStatistics(imageUrl, 'unfavorite');
            } else {
              await addToFavorites(userId, imageUrl, imageName);
              await bot.answerCallbackQuery(id, { text: '❤️ تمت الإضافة للمفضلات', show_alert: false });
              await updateImageStatistics(imageUrl, 'favorite');
              await logActivity(userId, 'added_favorite', `أضاف ${imageName} للمفضلات`);
            }
          } catch (err) {
            console.error('❌ خطأ في المفضلات:', err.message);
            await bot.answerCallbackQuery(id, { text: '❌ حدث خطأ', show_alert: true });
          }
        } else if (data === 'cancel_add') {
          // إلغاء عملية إضافة الصورة
          delete userStates[chatId];
          await bot.sendMessage(chatId, '❌ تم إلغاء عملية الإضافة');
        } else if (data.startsWith('addimg_')) {
          // إنهاء عملية إضافة الصورة وحفظها
          const category = data.replace('addimg_', '');
          
          if (!userStates[chatId] || userStates[chatId].step !== 3) {
            await bot.sendMessage(chatId, '⚠️ حدث خطأ. استخدم /addimage للبدء من جديد');
            return;
          }
          
          try {
            userStates[chatId].category = category;
            const state = userStates[chatId];
            
            // التحقق من أن لدينا جميع البيانات المطلوبة
            if (!state.imageUrl || !state.name) {
              await bot.sendMessage(chatId, '⚠️ حدث خطأ. استخدم /addimage للبدء من جديد');
              delete userStates[chatId];
              return;
            }
            
            // حفظ الصورة في Firestore
            const catNames = { korea: 'كوري', all: 'عالمي', home: 'المنزل' };
            const categoryName = catNames[category] || category;
            
            console.log(`📝 جاري حفظ الصورة: ${state.name}`);
            const added = await addImageToFirestore(
              state.imageUrl,
              state.name,
              [category]
            );
            
            console.log(`💾 نتيجة الحفظ: ${added}`);
            
            if (added) {
              // تحديث IMAGE_META محلياً
              IMAGE_META[state.imageUrl] = {
                name: state.name,
                keywords: [category]
              };
              
              console.log(`✅ تم حفظ الصورة بنجاح: ${state.name}`);
              
              // تسجيل النشاط وحفظ بيانات المستخدم
              const userId = from.id;
              await logActivity(userId, 'added_image', `أضاف صورة: ${state.name}`);
              await saveUserData(userId, { username: from.first_name });
              
              await bot.sendMessage(chatId,
                `✅ تمت الإضافة بنجاح!\n\n` +
                `📸 ${state.name}\n` +
                `🎯 ${categoryName}\n` +
                `🔗 ${state.imageUrl}`
              );
            } else {
              console.log(`❌ فشل حفظ الصورة: ${state.name}`);
              await bot.sendMessage(chatId, '❌ حدث خطأ في حفظ الصورة في قاعدة البيانات');
            }
            
            delete userStates[chatId];
          } catch (err) {
            console.error('❌ خطأ في إضافة الصورة:', err.message);
            console.error('📋 التفاصيل:', err);
            await bot.sendMessage(chatId, `❌ حدث خطأ في الحفظ:\n${err.message}`);
            delete userStates[chatId];
          }
        } else if (data.startsWith('cat_')) {
          const cat = data.replace('cat_', '');
          const catNames = { all: 'الكل', korea: 'الكورية', home: 'المنزل', fav: 'المفضلة' };
          await bot.sendMessage(chatId, `✅ تم اختيار: ${catNames[cat] || cat}`);
        }
      } catch (err) {
        console.error('❌ خطأ في الزر:', err.message);
      }
    });

    // معالجة الأخطاء
    bot.on('polling_error', (err) => {
      if (err.code === 'ETELEGRAM' && err.message.includes('409')) {
        console.warn('⚠️ تحذير: اكتشاف نسخ متعددة من البوت!');
        console.warn('⚠️ يجب إيقاف النسخة الأخرى من البوت');
      } else {
        console.error('❌ خطأ في Polling:', err.message);
      }
    });

    console.log('🤖 البوت يعمل بنجاح مع polling');
    isStarting = false;
  } catch (err) {
    console.error('❌ خطأ في تشغيل البوت:', err.message);
    isStarting = false;
    bot = null;
  }
}

// تشغيل البوت عند بدء الخادم
if (typeof window === 'undefined') {
  // Server-side only
  startBotPolling().catch(console.error);
}

module.exports = { startBotPolling };
