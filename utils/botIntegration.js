// ملف التكامل مع بوت تليجرام
// هذا الملف سيتم استخدامه لربط أوامر البوت مع المعرض

const GalleryCommands = require('./galleryCommands');

class GalleryBotIntegration {
  constructor(bot) {
    this.bot = bot;
    this.setupCommands();
  }

  setupCommands() {
    // أمر فتح المعرض
    this.bot.onText(/\/gallery/, (msg) => {
      const chatId = msg.chat.id;
      const galleryLink = GalleryCommands.sendGalleryLink();
      
      this.bot.sendMessage(chatId, 
        `🎨 ${galleryLink.text}\n\n${galleryLink.description}\n\n👇 اضغط على الرابط:\n${process.env.GALLERY_URL || 'http://localhost:3000'}/gallery`,
        {
          reply_markup: {
            inline_keyboard: [[
              {
                text: '🎨 فتح المعرض',
                url: `${process.env.GALLERY_URL || 'http://localhost:3000'}/gallery`
              }
            ]]
          }
        }
      );
    });

    // أمر عرض الفئات
    this.bot.onText(/\/categories/, (msg) => {
      const chatId = msg.chat.id;
      const categories = GalleryCommands.getCategories();
      
      let text = '📂 الفئات المتاحة:\n\n';
      categories.forEach(cat => {
        text += `${cat.emoji} ${cat.name} - ${cat.count}\n`;
      });
      
      text += '\n💡 استخدم /gallery للدخول للمعرض';
      
      this.bot.sendMessage(chatId, text);
    });

    // أمر معلومات المعرض
    this.bot.onText(/\/gallery_info/, (msg) => {
      const chatId = msg.chat.id;
      const info = GalleryCommands.getInfo();
      
      let text = `${info.title}\n\n`;
      text += `${info.description}\n\n`;
      text += '✨ المميزات:\n';
      info.features.forEach(feature => {
        text += `${feature}\n`;
      });
      
      this.bot.sendMessage(chatId, text);
    });

    // أمر المفضلة
    this.bot.onText(/\/favorites/, (msg) => {
      const chatId = msg.chat.id;
      
      this.bot.sendMessage(chatId, 
        '♥ فئة المفضلة\n\n' +
        '💾 يمكنك حفظ صورك المفضلة بالضغط على زر القلب ♥ في المعرض.\n\n' +
        '✨ سيتم حفظها تلقائياً على جهازك.\n\n' +
        '🔗 ادخل المعرض: /gallery',
        {
          reply_markup: {
            inline_keyboard: [[
              {
                text: '❤️ المفضلة',
                callback_data: 'gallery_favorites'
              }
            ]]
          }
        }
      );
    });

    // أمر البحث
    this.bot.onText(/\/search (.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const query = match[1];
      
      this.bot.sendMessage(chatId,
        `🔍 البحث عن: "${query}"\n\n` +
        '📸 استخدم شريط البحث في المعرض للبحث عن الصور.\n\n' +
        'اكتب أول 4 أحرف من اسم الصورة للعثور عليها بسرعة.\n\n' +
        '🔗 ادخل المعرض الآن:',
        {
          reply_markup: {
            inline_keyboard: [[
              {
                text: '🎨 فتح المعرض',
                url: `${process.env.GALLERY_URL || 'http://localhost:3000'}/gallery`
              }
            ]]
          }
        }
      );
    });

    // أمر المساعدة
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      
      const helpText = `
🎨 *أوامر معرض الشعبيات*

📚 الأوامر الأساسية:
/gallery - فتح المعرض الكامل
/categories - عرض الفئات المتاحة
/gallery_info - معلومات عن المعرض
/favorites - فئة المفضلة
/search [كلمة] - البحث عن صورة

💡 نصائح:
• اضغط على القلب ♥ لحفظ المفضلة
• استخدم شريط البحث للعثور السريع
• استخدم الأسهم للتنقل بين الصور

🎮 اختصارات لوحة المفاتيح:
Esc - إغلاق المعرض
← → - التنقل بين الصور

❓ هل تحتاج إلى مساعدة؟
تواصل معنا عبر الدعم الفني.
      `;
      
      this.bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    });
  }

  // دالة لإرسال بطاقة المعرض
  sendGalleryCard(chatId) {
    const galleryLink = GalleryCommands.sendGalleryLink();
    
    return this.bot.sendMessage(chatId,
      `🎨 *${galleryLink.text}*\n\n` +
      `${galleryLink.description}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎨 فتح المعرض',
              url: `${process.env.GALLERY_URL || 'http://localhost:3000'}/gallery`
            }
          ]]
        }
      }
    );
  }
}

module.exports = GalleryBotIntegration;
