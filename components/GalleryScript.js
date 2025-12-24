export default function GalleryScript() {
  if (typeof window === 'undefined') return;

  (function () {
    "use strict";

    var topImages = [
      "https://i.ibb.co/9mXDcKrD/photo-5877268892239989707-x.jpg",
      "https://i.ibb.co/kV3VP0Jx/photo-5877268892239989702-x.jpg",
      "https://i.ibb.co/cS1wzpXz/photo-5877268892239989701-x.jpg",
      "https://i.ibb.co/P3GhdTz/photo-5877268892239989700-x.jpg",
      "https://i.ibb.co/k69cC84P/photo-5877268892239989699-x.jpg",
      "https://i.ibb.co/PG0WQ0FH/photo-5877268892239989698-x.jpg",
      "https://i.ibb.co/Z6R1YQhH/photo-5877268892239989697-x.jpg",
      "https://i.ibb.co/HTJkJ2qN/2025-11-17-020156.jpg",
      "https://i.ibb.co/KjYYkYPf/20251117014834.jpg",
      "https://i.ibb.co/bRLJ3z4G/20251116222702.jpg",
      "https://i.ibb.co/3mJZY47h/20251116212943.jpg"
    ];

    var HOME_URLS = [
      "https://i.ibb.co/jYpxHH4/6005647766816149053.jpg",
      "https://i.ibb.co/1tqYtHsy/6005647766816148934.jpg",
      "https://i.ibb.co/LDFHVZMm/6005647766816148927.jpg"
    ];

    var KOREA_URLS = [
      "https://i.ibb.co/cS1wzpXz/photo-5877268892239989701-x.jpg",
      "https://i.ibb.co/P3GhdTz/photo-5877268892239989700-x.jpg",
      "https://i.ibb.co/3mJZY47h/20251116212943.jpg"
    ];

    var favs = JSON.parse(localStorage.getItem("favs") || "[]");
    var viewCache = {};

    function saveFavs() { localStorage.setItem("favs", JSON.stringify(favs)); }
    function getCount(u) { return viewCache[u] || 0; }
    function getCategoryForUrl(u) {
      if (KOREA_URLS.includes(u)) return "كوري";
      if (HOME_URLS.includes(u)) return "منزل";
      if (favs.includes(u)) return "مفضل";
      return "عام";
    }

    var currentCat = "all";
    var currentIndex = 0;

    // العناصر الرئيسية
    var container = document.getElementById("gallery-container");
    if (!container) return;

    var html = `
      <div style="width: 100%; direction: rtl; background: #1a1a1a; color: white; padding: 20px;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="color: #ffd700; font-size: 24px; font-weight: bold;">🎨 PUBG شعبيات</div>
            <button id="popuMenuBtn" style="background: #0d6efd; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">☰ الفئات</button>
          </div>
          <div style="margin-bottom: 15px;">
            <input type="text" id="popuSearch" placeholder="اكتب اول اربع حروف" style="width: 100%; padding: 12px; border-radius: 4px; border: 1px solid #444; background: #2a2a2a; color: white; font-size: 16px;">
          </div>
          <div id="popuGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-bottom: 40px;"></div>
        </div>
      </div>

      <aside id="popuDrawer" style="display: none; position: fixed; top: 0; right: 0; width: 250px; height: 100vh; background: #2a2a2a; z-index: 1000; padding: 20px; overflow-y: auto; color: white; border-left: 2px solid #ffd700;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <span style="font-size: 18px; font-weight: bold;">الفئات</span>
          <button id="popuDrawerClose" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">✕</button>
        </div>
        <div id="popuCategoriesContainer"></div>
      </aside>

      <div id="popuDrawerMask" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999;"></div>

      <div id="popuViewer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.98); z-index: 2000; padding: 20px; overflow: auto; direction: rtl;">
        <button id="popuViewerClose" style="position: absolute; top: 20px; left: 20px; background: #0d6efd; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">إغلاق</button>
        <button id="popuViewerPrev" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: #0d6efd; color: white; border: none; padding: 12px 16px; border-radius: 4px; cursor: pointer; font-size: 20px; font-weight: bold;">⟨</button>
        <button id="popuViewerNext" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: #0d6efd; color: white; border: none; padding: 12px 16px; border-radius: 4px; cursor: pointer; font-size: 20px; font-weight: bold;">⟩</button>
        <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: center;">
          <img id="popuViewerImg" alt="" style="max-width: 90%; max-height: 80%; border-radius: 8px;">
          <div id="popuViewerCap" style="color: white; margin-top: 20px; font-size: 18px; text-align: center;"></div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    var gridEl = document.getElementById("popuGrid");
    var searchEl = document.getElementById("popuSearch");
    var menuBtn = document.getElementById("popuMenuBtn");
    var drawer = document.getElementById("popuDrawer");
    var drawerClose = document.getElementById("popuDrawerClose");
    var drawerMask = document.getElementById("popuDrawerMask");
    var viewer = document.getElementById("popuViewer");
    var vImg = document.getElementById("popuViewerImg");
    var vCap = document.getElementById("popuViewerCap");
    var vClose = document.getElementById("popuViewerClose");
    var vPrev = document.getElementById("popuViewerPrev");
    var vNext = document.getElementById("popuViewerNext");
    var catContainer = document.getElementById("popuCategoriesContainer");

    function openDrawer() { drawer.style.display = "block"; drawerMask.style.display = "block"; }
    function closeDrawer() { drawer.style.display = "none"; drawerMask.style.display = "none"; }
    function openViewer() { viewer.style.display = "block"; }
    function closeViewer() { viewer.style.display = "none"; }

    menuBtn.addEventListener("click", openDrawer);
    drawerClose.addEventListener("click", closeDrawer);
    drawerMask.addEventListener("click", closeDrawer);
    vClose.addEventListener("click", closeViewer);

    function getAllImages() {
      var set = new Set([].concat(topImages, HOME_URLS, KOREA_URLS));
      return Array.from(set);
    }

    function getHotImages() {
      var all = getAllImages();
      all.sort((a, b) => getCount(b) - getCount(a));
      return all;
    }

    function renderGrid() {
      var list;
      if (currentCat === "all") list = topImages;
      else if (currentCat === "korea") list = KOREA_URLS;
      else if (currentCat === "home") list = HOME_URLS;
      else if (currentCat === "fav") list = favs;
      else if (currentCat === "hot") list = getHotImages();
      else list = topImages;

      gridEl.innerHTML = "";
      list.forEach((u, i) => {
        var card = document.createElement("div");
        card.style.cssText = "background: #2a2a2a; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; aspect-ratio: 1/1;";
        card.dataset.url = u;

        var isFav = favs.includes(u);
        card.innerHTML = `
          <span style="position: absolute; top: 5px; right: 5px; background: #ffd700; color: black; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 12px; z-index: 1;">${i + 1}</span>
          <button class="popu-fav" style="position: absolute; top: 5px; left: 5px; background: none; border: none; font-size: 20px; color: ${isFav ? '#ff4444' : 'white'}; cursor: pointer; z-index: 2;" title="مفضلة">♥</button>
          <img loading="lazy" src="${u}" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;">
          <span style="position: absolute; bottom: 25px; left: 0; background: #0d6efd; color: white; padding: 4px 8px; font-size: 11px;">${getCategoryForUrl(u)}</span>
          <span style="position: absolute; bottom: 0; left: 0; background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; font-size: 11px;"><i>👁</i> ${getCount(u)}</span>
        `;

        card.addEventListener("click", function (e) {
          if (e.target.closest(".popu-fav")) return;
          currentIndex = list.indexOf(u);
          vImg.src = u;
          vCap.textContent = `${getCategoryForUrl(u)} • ${i + 1}/${list.length}`;
          viewCache[u] = (viewCache[u] || 0) + 1;
          openViewer();
        });

        var favBtn = card.querySelector(".popu-fav");
        favBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var idx = favs.indexOf(u);
          if (idx === -1) favs.push(u);
          else favs.splice(idx, 1);
          saveFavs();
          favBtn.style.color = favs.includes(u) ? '#ff4444' : 'white';
          if (currentCat === "fav") renderGrid();
        });

        gridEl.appendChild(card);
      });

      applySearch();
    }

    function updateCategories() {
      var cats = [
        { id: "all", name: "الكل", emoji: "🌍" },
        { id: "korea", name: "الكورية", emoji: "🇰🇷" },
        { id: "home", name: "المنزل", emoji: "🏠" },
        { id: "fav", name: "المفضلة", emoji: "♥" },
        { id: "hot", name: "الأكثر مشاهدة", emoji: "🔥" }
      ];

      catContainer.innerHTML = cats.map(c => `
        <div data-cat="${c.id}" style="padding: 12px; cursor: pointer; border-bottom: 1px solid #444; color: ${currentCat === c.id ? '#ffd700' : '#ccc'}; font-size: 16px; font-weight: ${currentCat === c.id ? 'bold' : 'normal'};">
          ${c.emoji} ${c.name}
        </div>
      `).join("");

      catContainer.querySelectorAll("[data-cat]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentCat = btn.dataset.cat;
          renderGrid();
          updateCategories();
          closeDrawer();
        });
      });
    }

    function applySearch() {
      var term = searchEl.value.toLowerCase().trim();
      gridEl.querySelectorAll("[data-url]").forEach(card => {
        var show = !term || card.dataset.url.includes(term);
        card.style.display = show ? "block" : "none";
      });
    }

    searchEl.addEventListener("input", applySearch);

    vPrev.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + gridEl.children.length) % gridEl.children.length;
      var card = gridEl.children[currentIndex];
      while (card && card.style.display === "none") {
        currentIndex = (currentIndex - 1 + gridEl.children.length) % gridEl.children.length;
        card = gridEl.children[currentIndex];
      }
      if (card) vImg.src = card.dataset.url;
    });

    vNext.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % gridEl.children.length;
      var card = gridEl.children[currentIndex];
      while (card && card.style.display === "none") {
        currentIndex = (currentIndex + 1) % gridEl.children.length;
        card = gridEl.children[currentIndex];
      }
      if (card) vImg.src = card.dataset.url;
    });

    document.addEventListener("keydown", e => {
      if (viewer.style.display !== "block") return;
      if (e.key === "Escape") closeViewer();
      else if (e.key === "ArrowLeft") vPrev.click();
      else if (e.key === "ArrowRight") vNext.click();
    });

    renderGrid();
    updateCategories();
  })();
}
