const TelegramBot = require('node-telegram-bot-api');
const GalleryCommands = require('./utils/galleryCommands');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ خطأ: TELEGRAM_BOT_TOKEN غير موجود');
  process.exit(1);
}

console.log('🤖 تحميل بوت تليجرام...');
console.log('⏰ الوقت:', new Date().toLocaleString('ar-SA'));

const bot = new TelegramBot(token, { polling: true });
const GALLERY_URL = process.env.RENDER_EXTERNAL_URL || 'https://bot-tel-4p2k.onrender.com';

// أمر البدء
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  bot.sendMessage(chatId,
    `👋 *مرحبًا ${firstName}!*\n\n` +
    `🎨 *أنا بوت معرض الشعبيات*\n` +
    `مرحبًا بك في أكبر معرض لشعبيات لعبة PUBG 🎮\n\n` +
    `✨ *ما الذي يمكنك فعله؟*\n` +
    `🖼️ تصفح 600+ صورة عالية الجودة\n` +
    `🔍 البحث الذكي بالعربية\n` +
    `♥️ حفظ صورك المفضلة\n` +
    `📂 تصنيفات منظمة\n\n` +
    `👇 *اختر ما تريد:*`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎨 فتح المعرض',
              url: GALLERY_URL
            },
            {
              text: '❓ المساعدة',
              callback_data: 'help'
            }
          ],
          [
            {
              text: '📂 الفئات',
              callback_data: 'categories'
            },
            {
              text: 'ℹ️ المعرض',
              callback_data: 'info'
            }
          ]
        ]
      }
    }
  );
});

// أمر فتح المعرض
bot.onText(/\/gallery/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 
    `🎨 *معرض الشعبيات*\n\n` +
    `📊 معرض شامل لشعبيات لعبة PUBG\n` +
    `يحتوي على 600+ صورة عالية الجودة\n\n` +
    `✨ *الميزات:*\n` +
    `🔍 بحث متقدم بالعربية\n` +
    `♥️ حفظ المفضلة\n` +
    `📂 تصنيفات متعددة\n` +
    `🖼️ عارض صور احترافي\n` +
    `⌨️ تحكم بلوحة المفاتيح\n\n` +
    `👇 *اضغط لفتح المعرض:*`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎨 فتح المعرض الآن',
              url: GALLERY_URL
            }
          ],
          [
            {
              text: '📂 الفئات',
              callback_data: 'categories'
            },
            {
              text: '🏠 الرئيسية',
              callback_data: 'start_menu'
            }
          ]
        ]
      }
    }
  );
});

// أمر عرض الفئات
bot.onText(/\/categories/, (msg) => {
  const chatId = msg.chat.id;
  const categories = GalleryCommands.getCategories();
  
  let text = '📂 *الفئات المتاحة:*\n\n';
  categories.forEach((cat, idx) => {
    text += `${cat.emoji} *${cat.name}*\n`;
    text += `${cat.count}\n`;
    if (idx < categories.length - 1) text += '\n';
  });
  
  text += '\n\n💡 استخدم /gallery للدخول للمعرض الكامل';
  
  bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎨 المعرض',
            url: GALLERY_URL
          }
        ],
        [
          {
            text: '🏠 الرئيسية',
            callback_data: 'start_menu'
          }
        ]
      ]
    }
  });
});

// أمر معلومات المعرض
bot.onText(/\/gallery_info/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId,
    `ℹ️ *معلومات معرض الشعبيات*\n\n` +
    `📊 *الإحصائيات:*\n` +
    `🖼️ عدد الصور: 600+\n` +
    `📂 الفئات: 5\n` +
    `🔍 بحث ذكي بالعربية\n` +
    `♥️ نظام المفضلة\n\n` +
    `🌐 *الموقع:*\n` +
    `${GALLERY_URL}\n\n` +
    `🎯 *الميزات:*\n` +
    `✅ تصفح سهل وسريع\n` +
    `✅ تصميم احترافي\n` +
    `✅ حماية المحتوى\n` +
    `✅ دعم العربية الكامل`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎨 زيارة المعرض',
              url: GALLERY_URL
            }
          ],
          [
            {
              text: '🏠 الرئيسية',
              callback_data: 'start_menu'
            }
          ]
        ]
      }
    }
  );
});

// أمر المساعدة
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId,
    `💡 *المساعدة والأوامر*\n\n` +
    `/start - 👋 البدء والترحيب\n` +
    `/gallery - 🎨 فتح المعرض\n` +
    `/categories - 📂 الفئات\n` +
    `/gallery_info - ℹ️ المعرض\n\n` +
    `🔍 *للبحث:*\n` +
    `استخدم شريط البحث في المعرض\n\n` +
    `♥️ *للمفضلة:*\n` +
    `اضغط على ♥ على أي صورة\n\n` +
    `⌨️ *اختصارات:*\n` +
    `← → : التنقل\n` +
    `Esc : إغلاق`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎨 المعرض',
              url: GALLERY_URL
            }
          ],
          [
            {
              text: '🏠 الرئيسية',
              callback_data: 'start_menu'
            }
          ]
        ]
      }
    }
  );
});

// معالجة الأزرار (Callback Query)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  
  if (data === 'help') {
    bot.editMessageText(
      `💡 *المساعدة والأوامر*\n\n` +
      `/start - 👋 البدء\n` +
      `/gallery - 🎨 المعرض\n` +
      `/categories - 📂 الفئات\n` +
      `/gallery_info - ℹ️ المعرض\n\n` +
      `🔍 استخدم البحث في المعرض\n` +
      `♥️ اضغط ♥ لحفظ المفضلة`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎨 المعرض',
                url: GALLERY_URL
              }
            ],
            [
              {
                text: '⬅️ رجوع',
                callback_data: 'start_menu'
              }
            ]
          ]
        }
      }
    );
  } else if (data === 'categories') {
    const categories = GalleryCommands.getCategories();
    let text = '📂 *الفئات المتاحة:*\n\n';
    categories.forEach((cat) => {
      text += `${cat.emoji} *${cat.name}*\n${cat.count}\n\n`;
    });
    
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎨 المعرض',
              url: GALLERY_URL
            }
          ],
          [
            {
              text: '⬅️ رجوع',
              callback_data: 'start_menu'
            }
          ]
        ]
      }
    });
  } else if (data === 'info') {
    bot.editMessageText(
      `ℹ️ *معرض الشعبيات*\n\n` +
      `📊 600+ صورة عالية الجودة\n` +
      `🔍 بحث ذكي بالعربية\n` +
      `♥️ حفظ المفضلة\n` +
      `📂 تصنيفات منظمة\n` +
      `🎯 تصميم احترافي`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎨 المعرض',
                url: GALLERY_URL
              }
            ],
            [
              {
                text: '⬅️ رجوع',
                callback_data: 'start_menu'
              }
            ]
          ]
        }
      }
    );
  } else if (data === 'start_menu') {
    const firstName = query.from.first_name;
    bot.editMessageText(
      `👋 *مرحبًا ${firstName}!*\n\n` +
      `🎨 *معرض الشعبيات*\n\n` +
      `✨ *الميزات:*\n` +
      `🖼️ 600+ صورة\n` +
      `🔍 بحث عربي\n` +
      `♥️ مفضلة\n` +
      `📂 فئات\n\n` +
      `👇 *اختر:*`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎨 فتح المعرض',
                url: GALLERY_URL
              },
              {
                text: '❓ المساعدة',
                callback_data: 'help'
              }
            ],
            [
              {
                text: '📂 الفئات',
                callback_data: 'categories'
              },
              {
                text: 'ℹ️ المعرض',
                callback_data: 'info'
              }
            ]
          ]
        }
      }
    );
  }
  
  bot.answerCallbackQuery(query.id, '✅ تم!', false);
});

// معالجة الرسائل العادية
bot.on('message', (msg) => {
  if (!msg.text) return;
  if (msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();
  
  if (text.includes('معرض') || text.includes('gallery') || text.includes('صور')) {
    bot.sendMessage(chatId,
      `🎨 *هل تريد فتح المعرض؟*`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎨 فتح المعرض',
                url: GALLERY_URL
              }
            ]
          ]
        }
      }
    );
  } else {
    bot.sendMessage(chatId,
      `👋 *أهلاً!*\n\n` +
      `اضغط على أحد الأزرار:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎨 المعرض',
                url: GALLERY_URL
              }
            ],
            [
              {
                text: '❓ المساعدة',
                callback_data: 'help'
              },
              {
                text: '🏠 الرئيسية',
                callback_data: 'start_menu'
              }
            ]
          ]
        }
      }
    );
  }
});

// معالجة الأخطاء
bot.on('polling_error', (error) => {
  console.error('❌ خطأ:', error.message);
});

console.log('✅ البوت يعمل بنجاح!');
console.log('🎨 المعرض:', GALLERY_URL);
console.log('📡 جاهز للاستقبال...');
