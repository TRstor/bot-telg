const { topImages, IMAGE_META } = require('./public/gallery-data.js');

console.log('عدد الصور في topImages:', topImages.length);
console.log('عدد الصور في IMAGE_META:', Object.keys(IMAGE_META).length);

// فحص التكرار
const allUrls = new Set();
topImages.forEach(url => allUrls.add(url));
Object.keys(IMAGE_META).forEach(url => allUrls.add(url));

console.log('عدد الصور الفريدة (بدون تكرار):', allUrls.size);

// فحص الصور المكررة
const duplicates = new Set();
const seen = new Set();

topImages.forEach(url => {
  if (seen.has(url)) {
    duplicates.add(url);
  }
  seen.add(url);
});

Object.keys(IMAGE_META).forEach(url => {
  if (seen.has(url)) {
    duplicates.add(url);
  }
  seen.add(url);
});

if (duplicates.size > 0) {
  console.log('عدد الصور المكررة:', duplicates.size);
  const dupArray = Array.from(duplicates).slice(0, 5);
  console.log('أول 5 مكررات:', dupArray);
}
