import { getAllAnime } from "../backend/anime_api.js";

function san(str) {
  const d = document.createElement("div");
  d.textContent = String(str || "");
  return d.innerHTML;
}

async function loadAnime() {
  const animeList = document.getElementById("anime-list");
  if (!animeList) return;

  const animes = await getAllAnime();
  animeList.innerHTML = animes.length
    ? animes.map(a => `
        <div class="anime-card" onclick="openAnime(${Number(a.id)})">
          <img src="${san(a.image_url || a.image || '')}" alt="${san(a.title || a.name || '')}">
          <h3>${san(a.title || a.name || '')}</h3>
        </div>`).join("")
    : "<p>لا يوجد محتوى حالياً</p>";
}

// ✅ تعريف واحد فقط (كانت مكررة)
window.openAnime = function(id) {
  window.location.href = `./pages/anime.html?id=${id}`;
};

loadAnime();
