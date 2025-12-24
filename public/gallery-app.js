function normalizeArabic(str){
  if(!str) return "";
  let s = String(str).toLowerCase();
  s = s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "");
  s = s.replace(/[آأإ]/g, "ا")
       .replace(/ى/g, "ي")
       .replace(/ؤ/g,"و")
       .replace(/ئ/g,"ي")
       .replace(/ة/g,"ه");
  s = s.replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
       .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0));
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

const FAV_KEY = "pubg_favs";
function loadFavs(){ try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch{ return []; } }
function saveFavs(list){ localStorage.setItem(FAV_KEY, JSON.stringify(list)); }
let favorites = loadFavs();

// بيانات فارغة - سيتم التحميل من API الخادم
const topImages = [];
const KOREA_URLS = [];
const HOME_URLS = [];

const CATS = {
  all: topImages,
  korea: KOREA_URLS,
  home: HOME_URLS,
  fav: () => favorites
};

function getCategoryForUrl(url){
  if (favorites.includes(url)) return "مفضلة";
  
  const meta = IMAGE_META[url];
  if (meta && meta.keywords && Array.isArray(meta.keywords)) {
    if (meta.keywords.includes(400)) return "كورية";
    if (meta.keywords.includes("home") || meta.keywords.includes('all')) return "المنزل";
  }
  
  if (KOREA_URLS.includes(url)) return "كورية";
  if (HOME_URLS.includes(url)) return "المنزل";
  return "عالمية";
}

const container = document.getElementById("topGallery");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const counterEl = document.getElementById("counter");

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightboxImg");
const lbCaption = document.getElementById("lightboxCaption");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const closeBtn = document.getElementById("closeBtn");

let currentCategory = "all";
let visibleList = [];
let currentIndex = 0;

function makeCard(src, i){
  const meta = IMAGE_META[src] || { name: "", keywords: [] };
  const file = src.split("/").pop() || "";

  const card = document.createElement("div");
  card.className = "top-card";
  card.dataset.src = src;
  card.dataset.nameNorm = normalizeArabic(meta.name);
  card.dataset.keywordsNorm = normalizeArabic(meta.keywords ? meta.keywords.join(" ") : "");
  card.dataset.fileNorm = normalizeArabic(file);

  const num = document.createElement("span");
  num.className = "number";
  num.textContent = (i+1).toLocaleString("en-US");

  const img = document.createElement("img");
  img.src = src;
  img.alt = "صورة";
  img.loading = "lazy";
  img.addEventListener("error", ()=> card.classList.add("hidden"));

  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.textContent = "♥";
  favBtn.style.color = favorites.includes(src) ? "gold" : "#fff";
  favBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    const idx = favorites.indexOf(src);
    if(idx === -1) favorites.push(src); else favorites.splice(idx,1);
    saveFavs(favorites);
    if(currentCategory === "fav") render();
    else favBtn.style.color = favorites.includes(src) ? "gold" : "#fff";
    updateCounter();
  });

  const catBadge = document.createElement("span");
  catBadge.className = "cat-badge";
  catBadge.textContent = getCategoryForUrl(src);

  card.addEventListener("click", ()=> openLightboxFromSrc(src));

  card.append(num, img, favBtn, catBadge);
  return card;
}

function getListForCategory(){
  if(currentCategory === "fav") return [...favorites];
  const val = CATS[currentCategory];
  return Array.isArray(val) ? val : (typeof val === "function" ? val() : topImages);
}

function ensureNotEmpty(){
  const oldEmpty = container.querySelector(".empty");
  if(oldEmpty) oldEmpty.remove();
  if(!container.querySelector(".top-card:not(.hidden)")){
    const d = document.createElement("div");
    d.className = "empty";
    d.textContent = "لا توجد عناصر لعرضها هنا.";
    container.appendChild(d);
  }
}

function updateCounter(){
  const total = getListForCategory().length;
  const visible = container.querySelectorAll(".top-card:not(.hidden)").length;
  counterEl.textContent = `${visible}/${total}`;
}

function buildVisibleList(){
  visibleList = Array.from(container.querySelectorAll(".top-card:not(.hidden)")).map(el=>el.dataset.src);
}

function render(){
  const list = getListForCategory();
  container.innerHTML = "";
  list.forEach((src, i)=> container.appendChild(makeCard(src, i)));
  applySearch();
  ensureNotEmpty();
  updateActiveCatBtn();
  updateCounter();
}

function applySearch(){
  const q = normalizeArabic(searchInput.value);
  const cards = container.querySelectorAll(".top-card");
  if(!q){
    cards.forEach(c => c.classList.remove("hidden"));
    buildVisibleList();
    updateCounter();
    return;
  }
  cards.forEach(card=>{
    const haystack = [card.dataset.nameNorm, card.dataset.keywordsNorm, card.dataset.fileNorm].join(" ");
    const match = haystack.includes(q);
    card.classList.toggle("hidden", !match);
  });
  ensureNotEmpty();
  buildVisibleList();
  updateCounter();
}

function openLightboxFromSrc(src){
  buildVisibleList();
  let idx = visibleList.indexOf(src);
  if (idx === -1) {
    visibleList = getListForCategory();
    idx = visibleList.indexOf(src);
  }
  currentIndex = Math.max(0, idx);
  showInLightbox(currentIndex);
  lightbox.classList.remove("hidden");
  lightbox.setAttribute("aria-hidden","false");
}

function showInLightbox(index){
  if(!visibleList.length) return;
  if(index < 0) index = visibleList.length - 1;
  if(index >= visibleList.length) index = 0;
  currentIndex = index;
  const src = visibleList[currentIndex];
  lbImg.src = src;
  const meta = IMAGE_META[src] || {};
  const cat = getCategoryForUrl(src);
  lbCaption.textContent = (meta.name ? meta.name + " — " : "") + cat;
}

function closeLightbox(){
  lightbox.classList.add("hidden");
  lightbox.setAttribute("aria-hidden","true");
  lbImg.src = "";
}

prevBtn.addEventListener("click", (e)=>{ e.stopPropagation(); showInLightbox(currentIndex - 1); });
nextBtn.addEventListener("click", (e)=>{ e.stopPropagation(); showInLightbox(currentIndex + 1); });
closeBtn.addEventListener("click", (e)=>{ e.stopPropagation(); closeLightbox(); });

lightbox.addEventListener("click", (e)=>{
  const inner = e.target.closest(".lightbox-inner");
  if(!inner) closeLightbox();
});

document.addEventListener("keydown", (e)=>{
  if(lightbox.classList.contains("hidden")) return;
  if(e.key === "Escape") closeLightbox();
  else if(e.key === "ArrowLeft") showInLightbox(currentIndex - 1);
  else if(e.key === "ArrowRight") showInLightbox(currentIndex + 1);
});

const map = { btnAll:"all", btnKorea:"korea", btnHome:"home", btnFav:"fav" };
Object.entries(map).forEach(([id, cat])=>{
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener("click", ()=>{
    currentCategory = cat;
    closeDrawer();
    render();
  });
});

function updateActiveCatBtn(){
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.toggle("active", map[id] === currentCategory);
  });
}

const openDrawerBtn = document.getElementById("openDrawer");
const closeDrawerBtn = document.getElementById("closeDrawer");
const drawer = document.getElementById("drawer");
const backdrop = document.getElementById("drawerBackdrop");

function openDrawer(){ drawer.classList.add("open"); backdrop.classList.add("show"); }
function closeDrawer(){ drawer.classList.remove("open"); backdrop.classList.remove("show"); }

openDrawerBtn.addEventListener("click", openDrawer);
closeDrawerBtn.addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);
document.addEventListener("keydown",(e)=>{ if(e.key === "Escape") closeDrawer(); });

if (searchBtn) searchBtn.addEventListener("click", (e)=>{ e.preventDefault(); applySearch(); });
if (searchInput) {
  searchInput.addEventListener("input", applySearch);
  searchInput.addEventListener("keydown", (e)=>{ if(e.key === "Enter"){ e.preventDefault(); applySearch(); }});
}

// تحميل الصور من Firestore عند بدء الصفحة
async function loadImagesFromFirestore() {
  try {
    const response = await fetch('/api/bot?action=getImages');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.images && typeof data.images === 'object') {
      // تحويل البيانات من {url: {name, keywords}} إلى arrays
      const loadedImages = [];
      const koreaImages = [];
      const homeImages = [];
      
      for (const [url, meta] of Object.entries(data.images)) {
        if (url && meta && meta.name) {
          loadedImages.push(url);
          // تحديث IMAGE_META
          IMAGE_META[url] = meta;
          
          // تصنيف الصور حسب keywords
          if (meta.keywords && Array.isArray(meta.keywords)) {
            if (meta.keywords.includes(400)) {
              koreaImages.push(url);
            } else if (meta.keywords.includes("home") || meta.keywords.includes('all')) {
              homeImages.push(url);
            }
          }
        }
      }
      
      if (loadedImages.length > 0) {
        topImages.length = 0;
        topImages.push(...loadedImages);
        
        KOREA_URLS.length = 0;
        KOREA_URLS.push(...koreaImages);
        
        HOME_URLS.length = 0;
        HOME_URLS.push(...homeImages);
        
        CATS.all = topImages;
        CATS.korea = KOREA_URLS;
        CATS.home = HOME_URLS;
        
        console.log(`✅ تم تحميل ${loadedImages.length} صورة (${koreaImages.length} كورية، ${homeImages.length} منزل)`);
      }
    }
  } catch (err) {
    console.error('❌ خطأ في تحميل الصور:', err.message);
  }
  
  // إعادة رسم المعرض
  render();
}

// تحميل الصور عند بدء الصفحة (بدون render أولاً)
loadImagesFromFirestore();

document.addEventListener('contextmenu', e => {
  e.preventDefault();
  alert('⚠️ يمنع نسخ أو حفظ المحتوى — هذا المعرض محمي 🔒');
});

document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'I') ||
    (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'J') ||
    (e.ctrlKey && e.key.toUpperCase() === 'U')
  ) {
    e.preventDefault();
  }
});
