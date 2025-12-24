import TelegramBot from 'node-telegram-bot-api';

let bot = null;
let isInitialized = false;

// 📦 تحميل بيانات الصور
function getImageMeta() {
  try {
    const galleryData = require('/workspaces/bot-telg/public/gallery-data.js');
    return galleryData.IMAGE_META || {};
  } catch (err) {
    console.warn('⚠️ لم يتمكن من تحميل بيانات الصور:', err.message);
    return {};
  }
}

// 🤖 إنشاء البوت (مرة واحدة فقط)
function initializeBot() {
  if (isInitialized && bot) return bot;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('❌ TELEGRAM_BOT_TOKEN غير موجود');
  }

  bot = new TelegramBot(token, { polling: false });
  isInitialized = true;

  console.log('✅ تم تهيئة البوت بنجاح');
  return bot;
}

// 🔍 البحث عن الصور
function searchImages(query, imageMeta) {
  const normalizeArabic = (str) => {
    return (str || '')
      .replace(/[ـَُِّْ]/g, '')
      .replace(/ة/g, 'ه')
      .replace(/ي/g, 'ي')
      .toLowerCase()
      .trim();
  };

  const normalized = normalizeArabic(query);
  const results = [];

  for (const [url, meta] of Object.entries(imageMeta)) {
    const name = normalizeArabic(meta.name || '');
    if (name.includes(normalized)) {
      results.push({ url, name: meta.name });
    }
  }

  return results;
}

// 📨 معالجة الأوامر
async function handleCommand(msg, bot) {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const GALLERY_URL = process.env.RENDER_EXTERNAL_URL || 'https://bot-tel-4p2k.onrender.com';

  try {
    if (text === '/start') {
      await bot.sendMessage(chatId, '🎮 مرحباً في معرض شعبيات PUBG!\n\n/gallery - فتح المعرض\n/categories - الفئات\n/help - المساعدة', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 فتح المعرض', url: GALLERY_URL }],
            [{ text: '📖 المساعدة', callback_data: 'help' }],
          ],
        },
      });
    } else if (text === '/gallery') {
      await bot.sendMessage(chatId, '📸 تم فتح المعرض!\n🔗 اضغط هنا:', {
        reply_markup: {
          inline_keyboard: [[{ text: '📱 فتح المعرض', url: GALLERY_URL }]],
        },
      });
    } else if (text === '/categories') {
      await bot.sendMessage(chatId, '🎯 اختر فئة:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'الكل', callback_data: 'cat_all' }],
            [{ text: 'الكورية', callback_data: 'cat_korea' }],
            [{ text: 'المنزل', callback_data: 'cat_home' }],
            [{ text: 'المفضلة', callback_data: 'cat_fav' }],
          ],
        },
      });
    } else if (text === '/help') {
      await bot.sendMessage(chatId, 'ℹ️ كيفية الاستخدام:\n\n🔍 اكتب اسم الصورة للبحث عنها\n/gallery - فتح المعرض\n/start - القائمة الرئيسية');
    } else if (!text.startsWith('/')) {
      // البحث عن الصور
      const imageMeta = getImageMeta();
      const results = searchImages(text, imageMeta);

      if (results.length === 0) {
        await bot.sendMessage(chatId, `❌ لم أجد صور باسم "${text}"\n\nاكتب /help للمزيد من المعلومات`);
      } else {
        for (const img of results.slice(0, 3)) {
          await bot.sendPhoto(chatId, img.url, {
            caption: `📸 ${img.name}`,
          });
        }
      }
    }
  } catch (err) {
    console.error('❌ خطأ في معالجة الأمر:', err.message);
    await bot.sendMessage(chatId, '❌ حدث خطأ، حاول لاحقاً').catch(() => {});
  }
}

// 🔄 معالجة رسائل البوت
export async function POST(request) {
  try {
    const body = await request.json();

    // تشغيل البوت
    if (!bot) {
      bot = initializeBot();
    }

    // معالجة الرسائل العادية
    if (body.message) {
      await handleCommand(body.message, bot);
    }

    // معالجة الأزرار (callback queries)
    if (body.callback_query) {
      const { id, data, from } = body.callback_query;
      const chatId = from.id;

      try {
        await bot.answerCallbackQuery(id);

        if (data === 'help') {
          await bot.sendMessage(chatId, 'ℹ️ مساعدة:\n\n🔍 اكتب اسم الصورة للبحث\n/gallery - المعرض\n/categories - الفئات');
        } else if (data.startsWith('cat_')) {
          const cat = data.replace('cat_', '');
          await bot.sendMessage(chatId, `تم اختيار الفئة: ${cat}`);
        }
      } catch (err) {
        console.error('❌ خطأ في معالجة الزر:', err.message);
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('❌ خطأ في معالجة الطلب:', err.message);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// ✅ اختبار الاتصال
export async function GET(request) {
  return Response.json({
    status: 'Bot API is running',
    timestamp: new Date().toISOString(),
  });
}
