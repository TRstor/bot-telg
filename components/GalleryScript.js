export default function GalleryScript() {
  if (typeof window === 'undefined') return;

  (function () {
    "use strict";

    // ===== بيانات المعرض =====
    var TARGET_PATH = "/category/yDmBeD";
    function norm(p) { return (p || "").replace(/\/+$/, '') || "/"; }
    
    // تعطيل التحقق من المسار في الوضع الإنمائي
    // if (norm(location.pathname) !== norm(TARGET_PATH)) return;

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

    var IMAGE_META = {
      "https://i.ibb.co/9mXDcKrD/photo-5877268892239989707-x.jpg": { name: "بورشه", keywords: [] },
      "https://i.ibb.co/kV3VP0Jx/photo-5877268892239989702-x.jpg": { name: "اميرة الثلوج", keywords: [] },
      "https://i.ibb.co/cS1wzpXz/photo-5877268892239989701-x.jpg": { name: "Kuzuha", keywords: [] },
    };

    function getCategoryForUrl(u) {
      if (KOREA_URLS.includes(u)) return "الكورية";
      if (HOME_URLS.includes(u)) return "المنزل";
      if (favs.includes(u)) return "المفضلة";
      return "عالمية";
    }

    var FAV_KEY = "pubg_gallery_favs_v5";
    function loadFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; } }
    function saveFavs(x) { localStorage.setItem(FAV_KEY, JSON.stringify(x)); }
    var favs = loadFavs();

    var CATS = {
      all: topImages,
      home: HOME_URLS,
      korea: KOREA_URLS,
      fav: function () { return favs.slice(); },
      hot: function () { return computeHotList(); }
    };

    // ===== CSS =====
    var css = `
      :root { --bg:#2e2a2a; --card:#2b2b2b; --muted:#383434; --text:#fff; --gold:#ffcc00; --border:#2c2a2a; }
      html,body { direction:rtl; text-align:right; }
      .popu-center { position:fixed; inset:0; display:flex; justify-content:center; align-items:center; z-index:9998; pointer-events:none; }
      .popu-center .popu-btn { pointer-events:all; }
      .popu-btn {
        display:inline-block; padding:14px 22px; font-weight:800; font-size:17px;
        background:linear-gradient(135deg,#0d6efd,#7aa7ff); color:#fff; border:none; border-radius:14px; cursor:pointer;
        box-shadow:0 8px 25px rgba(0,0,0,.35); transition:transform .25s ease, box-shadow .25s ease;
      }
      .popu-btn:hover { transform:scale(1.07); box-shadow:0 12px 32px rgba(0,0,0,.5); }
      .popu-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(6px); display:none; justify-content:center; align-items:center; z-index:99999999999; }
      .popu-overlay.show { display:flex; }
      .popu-modal { width:480px; height:540px; max-width:96vw; max-height:90vh; background:var(--bg); border-radius:16px; color:var(--text); display:flex; flex-direction:column; box-shadow:0 20px 80px rgba(0,0,0,.6); overflow:hidden; position:relative; }
      .popu-header { display:grid; grid-template-columns:36px 1fr auto 36px; align-items:center; gap:6px; background:linear-gradient(180deg,#333232,#222121); padding:8px; }
      .popu-menu { grid-column:1; background:none; border:none; color:#fff; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:22px; border-radius:8px; cursor:pointer; }
      .popu-title-wrap { grid-column:2; display:flex; justify-content:center; align-items:center; gap:8px; }
      .popu-title { font-weight:900; color:var(--gold); }
      .popu-count { font-size:12px; opacity:.9; color:#ddd; }
      .popu-close { grid-column:4; background:none; border:none; color:#fff; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:20px; border-radius:8px; cursor:pointer; }
      .popu-search { padding:8px; background:#161a20; }
      .popu-search input { width:100%; padding:9px 12px; border-radius:10px; border:2px solid var(--border); background:#0f1318; color:#e6edf3; }
      .popu-body { flex:1; overflow:auto; padding:8px; background:var(--bg); }
      .popu-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
      .popu-card { position:relative; background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; cursor:pointer; transition:transform .2s; }
      .popu-card:hover { transform:scale(1.03); }
      .popu-card img { width:100%; height:150px; object-fit:cover; }
      .popu-badge { position:absolute; top:6px; left:6px; background:rgba(0,0,0,.6); color:#ffc107; font-size:11px; padding:3px 6px; border-radius:6px; z-index:2; font-weight:900; }
      .popu-fav { position:absolute; top:6px; right:6px; background:rgba(0,0,0,.5); border:1px solid #fff3; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff; cursor:pointer; z-index:2; }
      .popu-fav.active { background:#ff2d55; color:#fff; }
      .popu-tag { position:absolute; bottom:6px; left:6px; background:rgba(0,0,0,.6); color:#fff; font-size:9px; padding:2px 5px; border-radius:6px; z-index:2; }
      .popu-views { position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,.6); color:#fff; font-size:11px; padding:2px 6px; border-radius:6px; z-index:2; display:flex; align-items:center; gap:4px; }
      .popu-drawer { position:absolute; top:0; bottom:0; right:0; width:280px; background:#222; color:#eee; transform:translateX(100%); transition:transform .25s ease; z-index:30; box-shadow:-6px 0 25px rgba(0,0,0,.45); border-left:1px solid #fff1; }
      .popu-drawer.show { transform:translateX(0); }
      .popu-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #444; background:#1c1c1c; color:#ffc107; font-weight:800; }
      .popu-drawer-close { background:none; border:none; color:#fff; font-size:18px; cursor:pointer; border-radius:8px; padding:4px 8px; }
      .popu-drawer-content { padding:12px; display:flex; flex-direction:column; gap:10px; }
      .popu-cat { display:flex; justify-content:space-between; align-items:center; background:#ffffff22; border:1.5px solid #313030; border-radius:12px; padding:10px 12px; cursor:pointer; color:#fff; font-weight:800; }
      .popu-cat.active { border-color:#ffc107; box-shadow:0 0 0 2px #ffc10799 inset; color:#ffc107; }
      .popu-drawer-footer { padding:10px 12px; border-top:1px dashed #555; font-size:12px; color:#bbb; background:#1c1c1c; }
      .popu-drawer-mask { position:absolute; inset:0; background:transparent; z-index:25; display:none; }
      .popu-drawer-mask.show { display:block; }
      .popu-viewer { position:absolute; inset:0; background:rgba(0,0,0,.85); display:none; flex-direction:column; align-items:center; justify-content:center; z-index:40; }
      .popu-viewer.show { display:flex; }
      .popu-viewer-img { max-width:92%; max-height:78%; border-radius:12px; border:1px solid #333; background:#111; object-fit:contain; }
      .popu-viewer-caption { color:#eee; margin-top:8px; font-size:13px; text-align:center; }
      .popu-viewer-close { position:absolute; top:8px; left:8px; background:rgba(0,0,0,.6); color:#fff; border:1px solid #444; border-radius:10px; padding:6px 10px; cursor:pointer; }
      .popu-viewer-prev, .popu-viewer-next { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,.6); color:#fff; border:1px solid #444; border-radius:10px; padding:8px 12px; cursor:pointer; user-select:none; }
      .popu-viewer-prev { right:100%; margin-right:8px; }
      .popu-viewer-next { left:100%; margin-left:8px; }
      .hidden { display:none !important; }
    `;

    var styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.documentElement.appendChild(styleTag);

    // ===== HTML =====
    var center = document.createElement("div");
    center.className = "popu-center";
    center.innerHTML = `<button class="popu-btn" type="button">فتح معرض الشعبيات</button>`;
    document.body.appendChild(center);
    var openBtn = center.querySelector(".popu-btn");

    var overlay = document.createElement("div");
    overlay.className = "popu-overlay";
    overlay.innerHTML = `
      <div class="popu-modal" role="dialog" aria-modal="true">
        <div class="popu-header">
          <button class="popu-menu" title="القائمة">☰</button>
          <div class="popu-title-wrap">
            <div class="popu-title">PUBG شعبيات</div>
            <div class="popu-count">0/0</div>
          </div>
          <button class="popu-close" title="إغلاق">✕</button>
        </div>

        <div class="popu-search"><input type="text" id="popuSearch" placeholder="اكتب اول اربع حروف"></div>
        <div class="popu-body"><div class="popu-grid" id="popuGrid"></div></div>

        <aside class="popu-drawer" id="popuDrawer" aria-hidden="true">
          <div class="popu-drawer-head">
            <span>الفئات</span>
            <button class="popu-drawer-close" title="إغلاق">✕</button>
          </div>
          <div class="popu-drawer-content">
            <div class="popu-cat" data-cat="all"><span>الكل</span><span>→</span></div>
            <div class="popu-cat" data-cat="korea"><span>الكورية</span><span>→</span></div>
            <div class="popu-cat" data-cat="home"><span>المنزل</span><span>→</span></div>
            <div class="popu-cat" data-cat="fav"><span>المفضلة</span><span>♥</span></div>
            <div class="popu-cat" data-cat="hot"><span>الأكثر مشاهدة 🔥</span><span>→</span></div>
          </div>
          <div class="popu-drawer-footer">نعتذر عن أي معلومات غير دقيقة</div>
        </aside>
        <div class="popu-drawer-mask" id="popuDrawerMask"></div>

        <div class="popu-viewer" id="popuViewer" aria-hidden="true">
          <img class="popu-viewer-img" id="popuViewerImg" alt="">
          <div class="popu-viewer-caption" id="popuViewerCap"></div>
          <button class="popu-viewer-close" id="popuViewerClose">إغلاق</button>
          <button class="popu-viewer-prev" id="popuViewerPrev">⟨</button>
          <button class="popu-viewer-next" id="popuViewerNext">⟩</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // ===== عناصر DOM =====
    var modal = overlay.querySelector(".popu-modal");
    var gridEl = overlay.querySelector("#popuGrid");
    var searchEl = overlay.querySelector("#popuSearch");
    var countEl = overlay.querySelector(".popu-count");
    var menuBtn = overlay.querySelector(".popu-menu");
    var closeBtn = overlay.querySelector(".popu-close");
    var drawer = overlay.querySelector("#popuDrawer");
    var drawerClose = overlay.querySelector(".popu-drawer-close");
    var drawerMask = overlay.querySelector("#popuDrawerMask");
    var viewer = overlay.querySelector("#popuViewer");
    var vImg = overlay.querySelector("#popuViewerImg");
    var vCap = overlay.querySelector("#popuViewerCap");
    var vClose = overlay.querySelector("#popuViewerClose");
    var vPrev = overlay.querySelector("#popuViewerPrev");
    var vNext = overlay.querySelector("#popuViewerNext");

    var currentCat = "all";
    var visibleList = [];
    var currentIndex = 0;

    // ===== Firebase =====
    var viewCache = Object.create(null);
    function getCount(u) { return viewCache[u] || 0; }
    function setCount(u, c) { viewCache[u] = c; }

    function computeHotList() {
      var union = new Set([].concat(topImages, HOME_URLS, KOREA_URLS, favs));
      var arr = Array.from(union);
      arr.sort(function (a, b) { return getCount(b) - getCount(a); });
      return arr;
    }

    // ===== الدوال الأساسية =====
    function showOverlay() { overlay.classList.add("show"); renderGrid(); updateCatButtons(); }
    function hideOverlay() { overlay.classList.remove("show"); closeDrawer(); closeViewer(); }

    openBtn.addEventListener("click", showOverlay);
    closeBtn.addEventListener("click", hideOverlay);

    function openDrawer() { drawer.classList.add("show"); drawer.setAttribute("aria-hidden", "false"); drawerMask.classList.add("show"); }
    function closeDrawer() { drawer.classList.remove("show"); drawer.setAttribute("aria-hidden", "true"); drawerMask.classList.remove("show"); }

    menuBtn.addEventListener("click", function (e) { e.stopPropagation(); openDrawer(); });
    drawerClose.addEventListener("click", function (e) { e.stopPropagation(); closeDrawer(); });
    drawerMask.addEventListener("click", closeDrawer);

    modal.addEventListener("click", function (e) {
      if (drawer.classList.contains("show")) {
        var inside = e.target.closest("#popuDrawer") || e.target.closest(".popu-menu");
        if (!inside) closeDrawer();
      }
    });

    overlay.addEventListener("click", function (e) {
      if (!modal.contains(e.target)) hideOverlay();
    });

    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("show")) return;
      if (e.key === "Escape") {
        if (viewer.classList.contains("show")) { closeViewer(); return; }
        if (drawer.classList.contains("show")) { closeDrawer(); return; }
        hideOverlay();
      } else if (e.key === "ArrowLeft" && viewer.classList.contains("show")) {
        showInViewer(currentIndex - 1);
      } else if (e.key === "ArrowRight" && viewer.classList.contains("show")) {
        showInViewer(currentIndex + 1);
      }
    });

    async function renderGrid() {
      var list;
      if (currentCat === "fav") list = favs.slice();
      else if (typeof CATS[currentCat] === "function") list = CATS[currentCat]();
      else list = (CATS[currentCat] || topImages).slice();

      gridEl.innerHTML = "";
      list.forEach(function (u, i) {
        var card = document.createElement("div");
        card.className = "popu-card";
        card.dataset.url = u;
        card.innerHTML = `
          <span class="popu-badge">${i + 1}</span>
          <button class="popu-fav ${favs.includes(u) ? 'active' : ''}" title="مفضلة">♥</button>
          <img loading="lazy" src="${u}" alt="">
          <span class="popu-tag">${getCategoryForUrl(u)}</span>
          <span class="popu-views"><i>👁</i> <b class="num">${getCount(u)}</b></span>
        `;
        card.addEventListener("click", function (e) {
          if (e.target.closest(".popu-fav")) return;
          buildVisibleList();
          currentIndex = Math.max(0, visibleList.indexOf(u));
          showInViewer(currentIndex);
        });
        var favBtn = card.querySelector(".popu-fav");
        favBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          var idx = favs.indexOf(u);
          if (idx === -1) favs.push(u);
          else favs.splice(idx, 1);
          saveFavs(favs);
          favBtn.classList.toggle("active");
          if (currentCat === "fav") { renderGrid(); }
          updateCount();
        });

        gridEl.appendChild(card);
      });
      updateCount();
      applyFilter();
    }

    function updateCount() {
      var allList = (currentCat === "fav" ? favs : (typeof CATS[currentCat] === "function" ? CATS[currentCat]() : CATS[currentCat] || topImages));
      var visible = gridEl.querySelectorAll(".popu-card:not(.hidden)").length;
      countEl.textContent = visible + "/" + allList.length;
    }

    function applyFilter() {
      var t = (searchEl.value || "").trim().toLowerCase();
      gridEl.querySelectorAll(".popu-card").forEach(function (card) {
        var u = card.dataset.url;
        var name = (IMAGE_META[u] && IMAGE_META[u].name || "").toLowerCase();
        card.classList.toggle("hidden", !(name.includes(t)));
      });
      updateCount();
    }
    searchEl.addEventListener("input", applyFilter);

    function updateCatButtons() {
      overlay.querySelectorAll(".popu-cat").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-cat") === currentCat);
      });
    }
    overlay.querySelectorAll(".popu-cat").forEach(function (catBtn) {
      catBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        currentCat = catBtn.getAttribute("data-cat");
        closeDrawer();
        searchEl.value = "";
        updateCatButtons();
        renderGrid();
      });
    });

    function buildVisibleList() {
      visibleList = Array.from(gridEl.querySelectorAll(".popu-card:not(.hidden)"))
        .map(function (el) { return el.dataset.url; });
      if (!visibleList.length) {
        var list = (currentCat === "fav" ? favs : (typeof CATS[currentCat] === "function" ? CATS[currentCat]() : CATS[currentCat] || topImages));
        visibleList = list.slice();
      }
    }
    function clamp(i, len) { if (i < 0) return len - 1; if (i >= len) return 0; return i; }
    function showInViewer(i) {
      if (!visibleList.length) return;
      currentIndex = clamp(i, visibleList.length);
      var u = visibleList[currentIndex];
      vImg.src = u;
      var meta = IMAGE_META[u] || {};
      vCap.textContent = (meta.name ? meta.name + " — " : "") + getCategoryForUrl(u);
      viewer.classList.add("show");
      viewer.setAttribute("aria-hidden", "false");
    }
    function closeViewer() {
      viewer.classList.remove("show");
      viewer.setAttribute("aria-hidden", "true");
      vImg.src = "";
    }
    vClose.addEventListener("click", function (e) { e.stopPropagation(); closeViewer(); });
    vPrev.addEventListener("click", function (e) { e.stopPropagation(); showInViewer(currentIndex - 1); });
    vNext.addEventListener("click", function (e) { e.stopPropagation(); showInViewer(currentIndex + 1); });
    viewer.addEventListener("click", function (e) {
      var inner = e.target.closest(".popu-viewer-img");
      if (!inner) closeViewer();
    });
  })();
}
