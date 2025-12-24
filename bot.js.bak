const TelegramBot = require('node-telegram-bot-api');
const GalleryCommands = require('./utils/galleryCommands');

// ✅ تحميل بيانات الصور
let IMAGE_META = {};
try {
  const galleryData = require('./public/gallery-data.js');
  IMAGE_META = galleryData.IMAGE_META || {};
  console.log('✅ تم تحميل بيانات الصور:', Object.keys(IMAGE_META).length, 'صورة');
} catch (err) {
  console.warn('⚠️  لم يتمكن من تحميل بيانات الصور:', err.message);
}

const token = process.env.TELEGRAM_BOT_TOKEN;

// 🔍 فحص التوكن
console.log('\n' + '='.repeat(60));
console.log('🤖 بدء تشغيل بوت تليجرام');
console.log('='.repeat(60));
console.log('⏰ الوقت:', new Date().toLocaleString('ar-SA'));
console.log('📦 الإصدار:', require('./package.json').version);
console.log('🌍 البيئة:', process.env.NODE_ENV || 'development');

if (!token) {
  console.error('\n❌ خطأ حرج: TELEGRAM_BOT_TOKEN غير موجود!');
  console.error('⚠️  تأكد من إضافة التوكن في Render Environment Variables');
  console.error('='.repeat(60) + '\n');
  process.exit(1);
}

console.log('✅ التوكن موجود (الأول 20 حرف):', token.substring(0, 20) + '...');

try {
  const botاف = new TelegramBot(token, { polling: true });
  const GALLERY_URL = process.env.RENDER_EXTERNAL_URL || 'https://bot-tel-4p2k.onrender.com';
  
  console.log('✅ البوت تم إنشاؤه بنجاح');
  console.log('🎨 رابط المعرض:', GALLERY_URL);
  console.log('🔄 وضع البوت: Polling (الاستقصاء)');
  console.log('='.repeat(60) + '\n');

  // معالجة الرسائل العادية (البحث عن الصور)
  bot.on('message', (msg) => {
    if (!msg.text) return;
    
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;
    const searchText = msg.text.trim();
    
    // تجاهل الأوامر
    if (searchText.startsWith('/')) return;
    
    console.log('\n📨 رسالة جديدة:');
    console.log(`   👤 من: ${userName} (ID: ${userId})`);
    console.log(`   💬 النص: ${searchText.substring(0, 50)}${searchText.length > 50 ? '...' : ''}`);
    console.log(`   🔗 Chat ID: ${chatId}`);
    
    // محاولة البحث عن الصورة بالاسم
    if (searchText.length > 2) {
      const searchNormalized = searchText.toLowerCase().trim();
      let foundImage = null;
      let foundName = '';
      
      console.log(`   🔍 البحث عن: "${searchText}"`);
      console.log(`   📊 عدد الصور المتاحة: ${Object.keys(IMAGE_META).length}`);
      
      // البحث في البيانات
      for (const [imageUrl, metadata] of Object.entries(IMAGE_META)) {
        if (metadata && metadata.name) {
          const imageName = String(metadata.name).toLowerCase();
          if (imageName.includes(searchNormalized)) {
            foundImage = imageUrl;
            foundName = metadata.name;
            console.log(`   ✅ وجدت صورة: ${foundName}`);
            break;
          }
        }
      }
      
      if (foundImage) {
        console.log(`   ➡️  إرسال الصورة: ${foundName}`);
        
        bot.sendPhoto(chatId, foundImage, {
          caption: `🖼️ *${foundName}*\n\nللمزيد من الصور اضغط على /gallery`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{text: '🎨 المعرض الكامل', url: GALLERY_URL}],
              [{text: '🏠 الرئيسية', callback_data: 'start_menu'}]
            ]
          }
        }).then(() => {
          console.log('   ✅ تم إرسال الصورة بنجاح');
        }).catch((err) => {
          console.error('   ❌ خطأ في الإرسال:', err.message);
        });
      } else {
        console.log(`   ❌ لم أجد صورة باسم: "${searchText}"`);
        console.log(`   💡 جرّب الأسماء: ${Object.values(IMAGE_META).slice(0, 3).map(m => m.name).join(', ')}`);
        
        bot.sendMessage(chatId,
          `❌ لم أجد صورة باسم "*${searchText}*"\n\n💡 جرّب:\n- /gallery للبحث الكامل\n- /categories لعرض الفئات\n- /start للقائمة الرئيسية`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{text: '🎨 المعرض', url: GALLERY_URL}],
                [{text: '🏠 الرئيسية', callback_data: 'start_menu'}]
              ]
            }
          }
        ).then(() => {
          console.log('   ✅ تم إرسال رسالة "لم أجد"');
        }).catch((err) => {
          console.error('   ❌ خطأ:', err.message);
        });
      }
    }
  });

  // أمر البدء
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    console.log(`\n✅ أمر /start من ${firstName}`);
    console.log(`   ➡️  إرسال رسالة ترحيب...`);
    
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
            [{text: '🎨 فتح المعرض', url: GALLERY_URL}, {text: '❓ المساعدة', callback_data: 'help'}],
            [{text: '📂 الفئات', callback_data: 'categories'}, {text: 'ℹ️ المعرض', callback_data: 'info'}]
          ]
        }
      }
    ).then(() => {
      console.log('   ✅ تم الإرسال بنجاح');
    }).catch((err) => {
      console.error('   ❌ خطأ:', err.message);
    });
  });

  // أمر المعرض
  bot.onText(/\/gallery/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`\n✅ أمر /gallery`);
    console.log(`   ➡️  إرسال رسالة المعرض...`);
    
    bot.sendMessage(chatId, 
      `🎨 *معرض الشعبيات*\n\n📊 معرض شامل لشعبيات لعبة PUBG\n600+ صورة عالية الجودة\n\n✨ الميزات:\n🔍 بحث متقدم\n♥️ حفظ المفضلة\n📂 تصنيفات\n🖼️ عارض احترافي`,
      {
        parse_mode: 'Markdown',
        reply_markup: {inline_keyboard: [
          [{text: '🎨 فتح المعرض', url: GALLERY_URL}],
          [{text: '📂 الفئات', callback_data: 'categories'}, {text: '🏠 الرئيسية', callback_data: 'start_menu'}]
        ]}
      }
    ).then(() => {
      console.log('   ✅ تم الإرسال بنجاح');
    }).catch((err) => {
      console.error('   ❌ خطأ:', err.message);
    });
  });

  // أمر الفئات
  bot.onText(/\/categories/, (msg) => {
    const chatId = msg.chat.id;
    const categories = GalleryCommands.getCategories();
    
    console.log(`\n✅ أمر /categories`);
    console.log(`   ➡️  إرسال قائمة الفئات...`);
    
    let text = '📂 *الفئات المتاحة:*\n\n';
    categories.forEach((cat, idx) => {
      text += `${cat.emoji} *${cat.name}*\n${cat.count}\n`;
      if (idx < categories.length - 1) text += '\n';
    });
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: {inline_keyboard: [
        [{text: '🎨 المعرض', url: GALLERY_URL}],
        [{text: '🏠 الرئيسية', callback_data: 'start_menu'}]
      ]}
    }).then(() => {
      console.log('   ✅ تم الإرسال بنجاح');
    }).catch((err) => {
      console.error('   ❌ خطأ:', err.message);
    });
  });

  // أمر المعلومات
  bot.onText(/\/gallery_info/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`\n✅ أمر /gallery_info`);
    console.log(`   ➡️  إرسال المعلومات...`);
    
    bot.sendMessage(chatId,
      `ℹ️ *معرض الشعبيات*\n\n📊 600+ صورة\n🔍 بحث عربي\n♥️ مفضلة\n📂 تصنيفات`,
      {parse_mode: 'Markdown', reply_markup: {inline_keyboard: [
        [{text: '🎨 المعرض', url: GALLERY_URL}]
      ]}}
    ).then(() => {
      console.log('   ✅ تم الإرسال بنجاح');
    }).catch((err) => {
      console.error('   ❌ خطأ:', err.message);
    });
  });

  // أمر المساعدة
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`\n✅ أمر /help`);
    console.log(`   ➡️  إرسال المساعدة...`);
    
    bot.sendMessage(chatId,
      `💡 *الأوامر:*\n/start - البدء\n/gallery - المعرض\n/categories - الفئات\n/help - المساعدة`,
      {parse_mode: 'Markdown'}
    ).then(() => {
      console.log('   ✅ تم الإرسال بنجاح');
    }).catch((err) => {
      console.error('   ❌ خطأ:', err.message);
    });
  });

  // معالجة الأزرار
  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    
    console.log(`\n🔘 ضغطة زر: ${data} من ${query.from.first_name}`);
    
    if (data === 'categories') {
      const categories = GalleryCommands.getCategories();
      console.log(`   ➡️  تحديث الرسالة بقائمة الفئات...`);
      
      let text = '📂 *الفئات المتاحة:*\n\n';
      categories.forEach((cat, idx) => {
        text += `${cat.emoji} *${cat.name}*\n${cat.count}\n`;
        if (idx < categories.length - 1) text += '\n';
      });
      
      bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {inline_keyboard: [
          [{text: '🎨 المعرض', url: GALLERY_URL}],
          [{text: '⬅️ رجوع', callback_data: 'start_menu'}]
        ]}
      }).then(() => {
        console.log('   ✅ تم التحديث بنجاح');
      }).catch((err) => {
        console.error('   ❌ خطأ:', err.message);
      });
      
    } else if (data === 'help') {
      console.log(`   ➡️  تحديث الرسالة بالمساعدة...`);
      
      bot.editMessageText(
        `💡 *الأوامر:*\n/start - البدء\n/gallery - المعرض\n/categories - الفئات\n/help - المساعدة`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {inline_keyboard: [
            [{text: '⬅️ رجوع', callback_data: 'start_menu'}]
          ]}
        }
      ).then(() => {
        console.log('   ✅ تم التحديث بنجاح');
      }).catch((err) => {
        console.error('   ❌ خطأ:', err.message);
      });
      
    } else if (data === 'info') {
      console.log(`   ➡️  تحديث الرسالة بالمعلومات...`);
      
      bot.editMessageText(
        `ℹ️ *معرض الشعبيات*\n\n📊 600+ صورة\n🔍 بحث عربي\n♥️ مفضلة\n📂 تصنيفات`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {inline_keyboard: [
            [{text: '🎨 المعرض', url: GALLERY_URL}],
            [{text: '⬅️ رجوع', callback_data: 'start_menu'}]
          ]}
        }
      ).then(() => {
        console.log('   ✅ تم التحديث بنجاح');
      }).catch((err) => {
        console.error('   ❌ خطأ:', err.message);
      });
      
    } else if (data === 'start_menu') {
      const firstName = query.from.first_name;
      console.log(`   ➡️  العودة للقائمة الرئيسية...`);
      
      bot.editMessageText(
        `👋 *مرحبًا ${firstName}!*\n\n🎨 *معرض الشعبيات*\n\n✨ الميزات:\n🖼️ 600+ صورة\n🔍 بحث عربي\n♥️ مفضلة\n📂 فئات`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {inline_keyboard: [
            [{text: '🎨 فتح المعرض', url: GALLERY_URL}, {text: '❓ المساعدة', callback_data: 'help'}],
            [{text: '📂 الفئات', callback_data: 'categories'}, {text: 'ℹ️ المعرض', callback_data: 'info'}]
          ]}
        }
      ).then(() => {
        console.log('   ✅ تم التحديث بنجاح');
      }).catch((err) => {
        console.error('   ❌ خطأ:', err.message);
      });
    }
    
    bot.answerCallbackQuery(query.id, '✅', false);
  });

  // معالجة الأخطاء
  bot.on('polling_error', (error) => {
    console.error('\n❌ خطأ في الاستقصاء:');
    console.error('   📍 الرسالة:', error.message);
    console.error('   📍 الكود:', error.code);
  });

  console.log('🎯 البوت جاهز الآن!');
  console.log('📡 الاستقصاء مشغل');
  console.log('⏳ في انتظار الرسائل...');
  console.log('='.repeat(60) + '\n');

} catch (error) {
  console.error('\n❌ خطأ حرج:');
  console.error('   📍 الرسالة:', error.message);
  console.error('   📍 الكود:', error.code);
  console.error('='.repeat(60) + '\n');
  process.exit(1);
}
