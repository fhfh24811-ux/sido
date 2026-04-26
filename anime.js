import { getAnimeById, getEpisodes } from "../backend/anime_api.js";

function san(str) {
  const d = document.createElement("div");
  d.textContent = String(str || "");
  return d.innerHTML;
}

const params  = new URLSearchParams(window.location.search);
const animeId = params.get("id");

// ✅ دالة واحدة نظيفة (كانت مكررة مع import ثاني في المنتصف)
async function loadAnime() {
  if (!animeId) return;
  try {
    const anime = await getAnimeById(animeId);
    const eps   = await getEpisodes(animeId);
    if (!anime) { console.error("لم يُوجد الأنمي"); return; }

    const titleEl  = document.getElementById("anime-title");
    const posterEl = document.getElementById("anime-poster");
    const descEl   = document.getElementById("anime-desc");
    const watchBtn = document.getElementById("watch-btn");
    const epsCont  = document.getElementById("episodes-container");

    if (titleEl)  titleEl.textContent  = anime.title || "";
    if (posterEl) posterEl.src         = anime.image_url || "";
    if (descEl)   descEl.textContent   = anime.description || "";

    if (watchBtn && eps.length) {
      watchBtn.onclick = () => window.location.href = `episode.html?ep=${eps[0].id}`;
    }

    if (epsCont) {
      epsCont.innerHTML = eps.map(ep => `
        <div class="ep-item" onclick="openEpisode(${Number(ep.id)})">
          الحلقة ${san(ep.episode_number)}
        </div>`).join("");
    }
  } catch (e) {
    console.error("خطأ في تحميل الأنمي:", e);
  }
}

window.openEpisode = function(id) {
  window.location.href = `episode.html?ep=${id}`;
};

loadAnime();
