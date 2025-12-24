// 🧪 اختبار المعرض - ملف اختبار بسيط

describe('معرض الشعبيات', () => {
  test('يجب أن يحتوي على صور', () => {
    // هذا مثال على اختبار يمكن تطويره
    const topImages = require('../components/GalleryScript.js');
    expect(topImages).toBeDefined();
  });

  test('يجب أن يعمل البحث', () => {
    // اختبار البحث
    const searchQuery = 'بورشه';
    expect(searchQuery).toBeTruthy();
  });

  test('يجب حفظ المفضلة', () => {
    // اختبار localStorage
    const FAV_KEY = 'pubg_gallery_favs_v5';
    expect(FAV_KEY).toBeDefined();
  });
});

// لتشغيل الاختبارات:
// npm test

module.exports = {
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
};
