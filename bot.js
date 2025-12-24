const TelegramBot = require('node-telegram-bot-api');
const GalleryCommands = require('./utils/galleryCommands');

// قراءة التوكن من environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ خطأ: TELEGRAM_BOT_TOKEN غير موجود في environment variables');
  process.exit(1);
}

console.log('🤖 تحميل بوت تليجرام...');
console.log('⏰ الوقت:', new Date().toLocaleString('ar-SA'));

// إنشاء البوت
const bot = new TelegramBot(token, { polling: true });

const GALLERY_URL = process.env.RENDER_EXTERNAL_URL || 'https://bot-tel-4p2k.onrender.com';

// أمر البدء
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  bot.sendMessage(chatId,
    `👋 مرحبًا ${firstName}!\n\n` +
    `🎨 أنا بوت معرض الشعبيات\n` +
    `مرحبًا بك في أكبر معرض لشعبيات لعبة PUBG\n\n` +
    `📂 الأوامر المتاحة:\n` +
    `/gallery - 🎨 فتح المعرض\n` +
    `/categories - 📂 عرض الفئات\n` +
    `/gallery_info - ℹ️ معلومات المعرض\n` +
    `/help - 💡 المساعدة\n\n` +
    `👇 اضغط على زر لفتح المعرض:`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 فتح المعرض',
            url: `${GALLERY_URL}`
          }
        ]]
      }
    }
  );
});

// أمر فتح المعرض
bot.onText(/\/gallery/, (msg) => {
  const chatId = msg.chat.id;
  const galleryLink = GalleryCommands.sendGalleryLink();
  
  bot.sendMessage(chatId, 
    `🎨 ${galleryLink.text}\n\n` +
    `📊 معرض شامل لشعبيات لعبة PUBG\n` +
    `يحتوي على 600+ صورة عالية الجودة\n\n` +
    `✨ الميزات:\n` +
    `🔍 بحث متقدم بالعربية\n` +
    `♥️ حفظ المفضلة\n` +
    `📂 تصنيفات متعددة\n` +
    `🖼️ عارض صور احترافي\n\n` +
    `👇 اضغط لفتح المعرض:`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 فتح المعرض الآن',
            url: GALLERY_URL
          }
        ]]
      }
    }
  );
});

// أمر عرض الفئات
bot.onText(/\/categories/, (msg) => {
  const chatId = msg.chat.id;
  const categories = GalleryCommands.getCategories();
  
  let text = '📂 الفئات المتاحة:\n\n';
  categories.forEach((cat, idx) => {
    text += `${cat.emoji} ${cat.name}\n`;
    text += `   ${cat.count}\n\n`;
  });
  
  text += '💡 استخدم /gallery للدخول للمعرض الكامل';
  
  bot.sendMessage(chatId, text);
});

// أمر معلومات المعرض
bot.onText(/\/gallery_info/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId,
    `ℹ️ معلومات معرض الشعبيات\n\n` +
    `📊 الإحصائيات:\n` +
    `🖼️ عدد الصور: 600+\n` +
    `📂 الفئات: 5\n` +
    `🔍 بحث ذكي بالعربية\n` +
    `♥️ نظام المفضلة\n\n` +
    `🌐 الموقع:\n` +
    `${GALLERY_URL}\n\n` +
    `🎯 الميزات:\n` +
    `✅ تصفح سهل وسريع\n` +
    `✅ تصميم احترافي\n` +
    `✅ حماية المحتوى\n` +
    `✅ دعم العربية الكامل\n\n` +
    `📬 للمزيد من المعلومات اضغط:\n`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 زيارة المعرض',
            url: GALLERY_URL
          }
        ]]
      }
    }
  );
});

// أمر المساعدة
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId,
    `💡 المساعدة والأوامر:\n\n` +
    `/start - البدء والترحيب\n` +
    `/gallery - فتح المعرض الكامل\n` +
    `/categories - عرض الفئات المتاحة\n` +
    `/gallery_info - معلومات المعرض\n` +
    `/help - هذه الرسالة\n\n` +
    `🔍 للبحث:\n` +
    `استخدم شريط البحث في المعرض\n` +
    `البحث يدعم العربية بشكل كامل\n\n` +
    `♥️ للمفضلة:\n` +
    `اضغط على القلب ♥ على أي صورة\n` +
    `سيتم حفظ المفضلة محليًا\n\n` +
    `📞 هل تواجه مشكلة؟\n` +
    `تأكد من استخدام متصفح حديث\n`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎨 المعرض',
            url: GALLERY_URL
          },
          {
            text: '⬅️ رجوع',
            callback_data: 'back'
          }
        ]]
      }
    }
  );
});

// معالجة الرسائل غير المعروفة
bot.on('message', (msg) => {
  if (!msg.text) return;
  
  // تخطي الأوامر
  if (msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();
  
  if (text.includes('معرض') || text.includes('gallery') || text.includes('صور')) {
    bot.sendMessage(chatId,
      `🎨 هل تريد فتح المعرض؟\n\n` +
      `استخدم الأمر /gallery\n` +
      `أو اضغط على الزر:`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎨 فتح المعرض',
              url: GALLERY_URL
            }
          ]]
        }
      }
    );
  } else {
    bot.sendMessage(chatId,
      `👋 أهلاً!\n\n` +
      `استخدم الأوامر:\n` +
      `/start - البدء\n` +
      `/gallery - المعرض\n` +
      `/help - المساعدة\n\n` +
      `أو اضغط:`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎨 المعرض',
              url: GALLERY_URL
            }
          ]]
        }
      }
    );
  }
});

// معالجة الأخطاء
bot.on('polling_error', (error) => {
  console.error('❌ خطأ في البوت:', error.message);
});

console.log('✅ البوت يعمل بنجاح!');
console.log('🎨 المعرض:', GALLERY_URL);
console.log('📡 جاهز للاستقبال...');
