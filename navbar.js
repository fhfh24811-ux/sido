import { supabase } from "../backend/supabase.js";
import { getTotalPoints, redeemPoints } from "./points.js";
import { searchAnime } from "../backend/anime_api.js";

// كشف الموقع: هل نحن في الجذر أم في pages/?
const inPages = window.location.pathname.includes("/pages/");
const toPages = inPages ? "."    : "./pages";
const toSrc   = inPages ? ".."   : ".";
const toCss   = inPages ? ".."   : ".";

const LINKS = [
  { label: "الرئيسية",       href: `${toSrc}/index.html`, icon: "🏠" },
  { label: "أنمي",           href: `${toPages}/anime.html`,   icon: "⚡" },
  { label: "أفلام",          href: `${toPages}/movies.html`,  icon: "🎬" },
  { label: "مسلسلات تركية",  href: `${toPages}/turkish.html`, icon: "🌙" },
  { label: "قائمتي",         href: `${toPages}/watchlist.html`,icon: "📌" },
];

const REWARDS = [
  { icon:"👑", title:"عضوية VIP شهر",        desc:"بدون إعلانات + محتوى حصري",  cost:1000 },
  { icon:"🎫", title:"إزالة الإعلانات أسبوع", desc:"مشاهدة نظيفة بالكامل",       cost:500  },
  { icon:"💳", title:"بطاقة مكافأة 1$",        desc:"40% منها رصيد حقيقي",        cost:800  },
  { icon:"⬇️", title:"تحميل 10 حلقات",        desc:"احفظ حلقاتك للأوفلاين",      cost:300  },
  { icon:"🎨", title:"ثيم حصري",               desc:"شكل مميز لحسابك",             cost:200  },
  { icon:"🏆", title:"شارة ذهبية",             desc:"تظهر دائماً بجانب اسمك",     cost:150  },
];

function isActive(href) {
  const p = window.location.pathname;
  const h = href.split("/").pop();
  return p.endsWith(h) || (h === "index.html" && (p.endsWith("/") || p.endsWith("/src/") || p === "/"));
}

function san(s) {
  const d = document.createElement("div");
  d.textContent = String(s || "");
  return d.innerHTML;
}

async function init() {
  // CSS
  if (!document.getElementById("sido-navbar-css")) {
    const lk = document.createElement("link");
    lk.id   = "sido-navbar-css";
    lk.rel  = "stylesheet";
    lk.href = `${toCss}/css/navbar.css`;
    document.head.appendChild(lk);
  }

  const { data } = await supabase.auth.getUser();
  const user     = data?.user || null;
  const pts      = user ? await getTotalPoints(user.id) : 0;

  // ===== NAVBAR =====
  const linksHtml = LINKS.map(l =>
    `<li><a href="${l.href}" class="${isActive(l.href) ? 'active' : ''}">${l.icon} ${l.label}</a></li>`
  ).join("");

  // زر login أو avatar+نقاط
  const authHtml = user
    ? `<div class="snav-points" id="snav-pts-btn" title="المكافآت">
         ⭐ <span id="snav-pts">${pts}</span>
       </div>
       <a href="${toPages}/account.html" class="snav-avatar" title="حسابي">👤</a>`
    : `<a href="${toPages}/login.html" class="snav-btn">
         <i class="fas fa-sign-in-alt"></i> دخول
       </a>
       <a href="${toPages}/register.html" class="snav-btn-outline">إنشاء حساب</a>`;

  const nav = document.createElement("nav");
  nav.className = "sido-navbar";
  nav.innerHTML = `
    <a href="${toSrc}/index.html" class="snav-logo snav-logo-3d">
      <i class="fas fa-dragon snav-logo-dragon"></i>
      <div class="snav-logo-text-3d"><span class="snav-logo-name">SID<em>O</em></span><span class="snav-logo-sub">أنمي · مسلسلات</span></div>
    </a>

    <ul class="snav-links">${linksHtml}</ul>

    <div class="snav-search-wrap" id="snav-search-wrap">
      <input type="text" class="snav-search" id="snav-search" placeholder="ابحث عن أنمي..." autocomplete="off">
      <span class="snav-search-icon">🔍</span>
      <div class="snav-search-results" id="snav-search-results"></div>
    </div>

    <div class="snav-right">
      ${authHtml}
      <button class="snav-mobile" id="snav-mob" aria-label="قائمة">☰</button>
    </div>`;

  // Drawer موبايل
  const drawerLinks = LINKS.map(l =>
    `<a href="${l.href}" class="${isActive(l.href) ? 'active' : ''}">${l.icon} ${l.label}</a>`
  ).join("") + (user
    ? `<a href="${toPages}/account.html">👤 حسابي</a>`
    : `<a href="${toPages}/login.html">🎮 تسجيل الدخول</a><a href="${toPages}/register.html">✨ إنشاء حساب</a>`);

  const drawer = document.createElement("div");
  drawer.className = "snav-drawer";
  drawer.id = "snav-drawer";
  drawer.innerHTML = drawerLinks;

  document.body.insertBefore(drawer, document.body.firstChild);
  document.body.insertBefore(nav,    document.body.firstChild);

  // toggle موبايل
  document.getElementById("snav-mob")?.addEventListener("click", () => {
    drawer.classList.toggle("open");
  });

  // ===== SEARCH =====
  const searchInput   = document.getElementById("snav-search");
  const searchResults = document.getElementById("snav-search-results");
  let searchTimer;

  searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (!q) { searchResults.innerHTML = ""; searchResults.classList.remove("open"); return; }
    searchTimer = setTimeout(async () => {
      const results = await searchAnime(q);
      if (!results.length) {
        searchResults.innerHTML = `<div class="sr-empty">لا نتائج لـ "${san(q)}"</div>`;
      } else {
        searchResults.innerHTML = results.slice(0, 6).map(a => `
          <a class="sr-item" href="${toPages}/anime.html?id=${a.id}">
            <img src="${san(a.image || '')}" alt="">
            <div>
              <div class="sr-name">${san(a.name)}</div>
              <div class="sr-meta">${san(a.genre || '')} ${a.year ? '· ' + a.year : ''}</div>
            </div>
          </a>`).join("");
      }
      searchResults.classList.add("open");
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!document.getElementById("snav-search-wrap")?.contains(e.target)) {
      searchResults.classList.remove("open");
    }
  });

  // ===== FOOTER =====
  const footer = document.createElement("footer");
  footer.className = "sido-footer";
  footer.innerHTML = `
    <div class="sf-grid">
      <div class="sf-brand">
        <a href="${toSrc}/index.html" class="snav-logo snav-logo-3d" style="margin-bottom:10px;display:inline-flex">
          <div class="snav-logo-icon">S</div>
          <span class="snav-logo-text">SID<em>O</em></span>
        </a>
        <p>منصتك الأولى للأنمي والمسلسلات — شاهد واكسب نقاطاً حقيقية مع كل حلقة.</p>
      </div>
      <div class="sf-col">
        <h4>📺 المحتوى</h4>
        <ul>
          <li><a href="${toPages}/anime.html">⚡ أنمي</a></li>
          <li><a href="${toPages}/movies.html">🎬 أفلام</a></li>
          <li><a href="${toPages}/turkish.html">🌙 مسلسلات تركية</a></li>
          <li><a href="${toPages}/watchlist.html">📌 قائمتي</a></li>
        </ul>
      </div>
      <div class="sf-col">
        <h4>⭐ المكافآت</h4>
        <ul>
          <li><a href="#" id="ft-rewards-link">بطاقات المكافآت</a></li>
          <li><a href="${toPages}/account.html">سجل النقاط</a></li>
          <li><a href="#">كيف تكسب نقاطاً</a></li>
        </ul>
      </div>
      <div class="sf-col">
        <h4>🔗 الحساب</h4>
        <ul>
          <li><a href="${toPages}/login.html">تسجيل الدخول</a></li>
          <li><a href="${toPages}/register.html">إنشاء حساب</a></li>
          <li><a href="${toPages}/account.html">حسابي</a></li>
        </ul>
      </div>
    </div>
    <div class="sf-bottom">
      <span>© 2025 SIDO — جميع الحقوق محفوظة</span>
      <span>شاهد · اكسب · استمتع ⚡</span>
    </div>`;
  document.body.appendChild(footer);

  // ===== REWARDS MODAL =====
  const rewardsHtml = REWARDS.map(r => `
    <div class="rm-item">
      <div class="rm-item-info">
        <span class="rm-item-icon">${r.icon}</span>
        <div class="rm-item-text">
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
        </div>
      </div>
      <button class="rm-buy" onclick="sidoRedeem(${r.cost}, '${r.title}')">
        ${r.cost} ⭐
      </button>
    </div>`).join("");

  const modal = document.createElement("div");
  modal.className = "rewards-bg";
  modal.id        = "sido-rewards-modal";
  modal.innerHTML = `
    <div class="rewards-box">
      <div class="rm-head">
        <h2>⭐ المكافآت والهدايا</h2>
        <button class="rm-close" id="rm-close">✕</button>
      </div>
      <div class="rm-balance">
        <p>رصيدك الحالي</p>
        <h3><span id="rm-pts">${pts}</span> نقطة</h3>
      </div>
      ${rewardsHtml}

    </div>`;
  document.body.appendChild(modal);

  // فتح/إغلاق المكافآت
  document.getElementById("snav-pts-btn")?.addEventListener("click", () =>
    modal.classList.add("open"));
  document.getElementById("ft-rewards-link")?.addEventListener("click", (e) => {
    e.preventDefault(); modal.classList.add("open");
  });
  document.getElementById("rm-close")?.addEventListener("click", () =>
    modal.classList.remove("open"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
}

// استبدال نقاط بمكافأة
window.sidoRedeem = async function(cost, title) {
  const ok = await redeemPoints(cost, title);
  if (ok) {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const total = await getTotalPoints(data.user.id);
      document.querySelectorAll("#snav-pts, #rm-pts").forEach(el => el.textContent = total);
    }
  }
};

init();
