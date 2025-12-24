// مثال: كيفية استخدام المعرض مع بوت تليجرام
// pip install pyTelegramBotAPI أو npm install node-telegram-bot-api

// ============================================
// مثال باستخدام JavaScript/Node.js
// ============================================

/*
const TelegramBot = require('node-telegram-bot-api');
const GalleryBotIntegration = require('./utils/botIntegration');

// إنشاء البوت
const token = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, { polling: true });

// تهيئة تكامل المعرض
const galleryIntegration = new GalleryBotIntegration(bot);

// رسالة ترحيب
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  bot.sendMessage(chatId,
    `👋 أهلاً ${firstName}!\n\n` +
    '🎨 مرحباً بك في معرض الشعبيات.\n\n' +
    'استخدم الأوامر التالية:\n' +
    '/gallery - فتح المعرض\n' +
    '/help - عرض المساعدة',
    {
      reply_markup: {
        keyboard: [
          [{ text: '🎨 المعرض' }, { text: '❓ المساعدة' }],
          [{ text: '📂 الفئات' }, { text: '♥ المفضلة' }]
        ],
        resize_keyboard: true
      }
    }
  );
});

// استقبال رسائل عادية
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '🎨 المعرض') {
    galleryIntegration.sendGalleryCard(chatId);
  } else if (text === '❓ المساعدة') {
    bot.sendMessage(chatId, 'استخدم /help للحصول على المساعدة');
  } else if (text === '📂 الفئات') {
    bot.sendMessage(chatId, 'استخدم /categories لعرض الفئات');
  } else if (text === '♥ المفضلة') {
    bot.sendMessage(chatId, 'استخدم /favorites لعرض المفضلة');
  }
});

console.log('🤖 البوت جاهز للعمل!');
*/

// ============================================
// مثال باستخدام Python
// ============================================

/*
import telebot
from os import environ

BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'
GALLERY_URL = environ.get('GALLERY_URL', 'http://localhost:3000')

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add('🎨 المعرض', '❓ المساعدة')
    markup.add('📂 الفئات', '♥ المفضلة')
    
    bot.reply_to(message,
        f"👋 أهلاً {message.from_user.first_name}!\n\n"
        "🎨 مرحباً بك في معرض الشعبيات.\n\n"
        "استخدم الأزرار أو الأوامر التالية:\n"
        "/gallery - فتح المعرض\n"
        "/help - عرض المساعدة",
        reply_markup=markup)

@bot.message_handler(commands=['gallery'])
def send_gallery(message):
    markup = telebot.types.InlineKeyboardMarkup()
    button = telebot.types.InlineKeyboardButton('🎨 فتح المعرض', 
        url=f'{GALLERY_URL}/gallery')
    markup.add(button)
    
    bot.send_message(message.chat.id,
        '🎨 معرض الشعبيات\n\n'
        'استمتع بأجمل صور الشعبيات من لعبة PUBG',
        reply_markup=markup)

@bot.message_handler(commands=['help'])
def send_help(message):
    help_text = (
        "🎨 *أوامر معرض الشعبيات*\n\n"
        "/gallery - فتح المعرض الكامل\n"
        "/categories - عرض الفئات\n"
        "/gallery_info - معلومات المعرض\n"
        "/favorites - المفضلة\n"
        "/search [كلمة] - البحث\n"
    )
    bot.send_message(message.chat.id, help_text, parse_mode='Markdown')

@bot.message_handler(func=lambda message: True)
def handle_text(message):
    if message.text == '🎨 المعرض':
        send_gallery(message)
    elif message.text == '❓ المساعدة':
        send_help(message)
    elif message.text == '📂 الفئات':
        bot.send_message(message.chat.id, 'استخدم /categories لعرض الفئات')
    elif message.text == '♥ المفضلة':
        bot.send_message(message.chat.id, 'استخدم /favorites لعرض المفضلة')

bot.polling()
*/

// ============================================
// متغيرات البيئة المطلوبة
// ============================================

/*
ملف .env

BOT_TOKEN=your_telegram_bot_token_here
GALLERY_URL=http://localhost:3000
NODE_ENV=development
*/

module.exports = {
  examples: {
    nodejs: 'استخدم const GalleryBotIntegration = require("./utils/botIntegration");',
    python: 'استخدم import telebot'
  }
};
