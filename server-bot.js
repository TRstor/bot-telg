// ⚡ ملف تشغيل البوت في الخادم (يعمل مرة واحدة عند البدء)
// هذا الملف يشغل polling البوت في الخلفية مع خادم Next.js

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

let bot = null;
let isStarting = false;
let IMAGE_META = {};

// تحميل بيانات الصور من الملف
function loadImageData() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'gallery-data.js');
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      const metaMatch = fileContent.match(/const\s+IMAGE_META\s*=\s*(\{[\s\S]*?\});/);
      if (metaMatch) {
        try {
          IMAGE_META = eval('(' + metaMatch[1] + ')');
          console.log('✅ تم تحميل:', Object.keys(IMAGE_META).length, 'صورة');
          return true;
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل البيانات:', e.message);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ لم يتمكن من تحميل بيانات الصور:', err.message);
  }
  return false;
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
    loadImageData();

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
            '/start - القائمة الرئيسية'
          );
        } else if (!text.startsWith('/') && text.trim()) {
          // البحث عن الصور
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

          if (results.length === 0) {
            await bot.sendMessage(chatId, `❌ لم أجد صور باسم "${text}"\n\nجرب: سونيك أو Marine أو Dragon`);
          } else {
            // إرسال أول 5 صور فقط
            for (const img of results.slice(0, 5)) {
              try {
                await bot.sendPhoto(chatId, img.url, { caption: `📸 ${img.name}` });
              } catch (err) {
                console.error(`❌ خطأ في إرسال صورة: ${err.message}`);
              }
            }
            
            if (results.length > 5) {
              await bot.sendMessage(chatId, `✅ تم عرض 5 من ${results.length} نتيجة`);
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
          await bot.sendMessage(chatId, '📖 المساعدة:\n\n🔍 اكتب اسم الصورة\n/gallery - المعرض\n/categories - الفئات');
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
