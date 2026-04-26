import { supabase } from "../backend/supabase.js";
import { getEpisodes, getEpisode } from "../backend/anime_api.js";
import { addPoints } from "./points.js";

function san(str) {
  const d = document.createElement("div");
  d.textContent = String(str || "");
  return d.innerHTML;
}

const params = new URLSearchParams(window.location.search);
const epId   = params.get("ep");
let episodes  = [];
let currentEp = null;
let pointsGiven = false;

async function loadEpisode() {
  if (!epId) return;
  try {
    currentEp = await getEpisode(epId);
    if (!currentEp) return;

    const titleEl   = document.getElementById("anime-title");
    const epTitleEl = document.getElementById("episode-title");
    const playerEl  = document.getElementById("player");

    if (titleEl)   titleEl.textContent   = currentEp.anime_title || "";
    if (epTitleEl) epTitleEl.textContent = "الحلقة " + (currentEp.episode_number || "");
    if (playerEl)  {
      playerEl.src = currentEp.video_url || "";

      // ✅ منح نقاط بعد 3 دقائق مشاهدة
      playerEl.addEventListener("timeupdate", async () => {
        if (!pointsGiven && playerEl.currentTime > 180) {
          pointsGiven = true;
          await addPoints(null, 10, "watch", "حلقة " + currentEp.episode_number);
          console.log("⭐ +10 نقاط للمشاهدة");
        }
      });
    }

    await loadEpisodesList(currentEp.anime_id);
  } catch (e) {
    console.error("خطأ في تحميل الحلقة:", e);
  }
}

async function loadEpisodesList(animeId) {
  try {
    episodes = await getEpisodes(animeId);
    const container = document.getElementById("ep-container");
    if (!container) return;

    container.innerHTML = episodes.map(ep => `
      <div class="${ep.id == epId ? 'active-ep' : ''}" onclick="openEpisode(${Number(ep.id)})">
        الحلقة ${san(ep.episode_number)}
      </div>`).join("");

    setupControls();
  } catch (e) {
    console.error("خطأ في تحميل الحلقات:", e);
  }
}

function setupControls() {
  const index  = episodes.findIndex(ep => ep.id == epId);
  const prevBtn = document.getElementById("prev-ep");
  const nextBtn = document.getElementById("next-ep");
  const dlBtn   = document.getElementById("download-btn");

  if (prevBtn) prevBtn.onclick = () => {
    if (episodes[index - 1]) openEpisode(episodes[index - 1].id);
    else alert("هذه أول حلقة!");
  };
  if (nextBtn) nextBtn.onclick = () => {
    if (episodes[index + 1]) openEpisode(episodes[index + 1].id);
    else alert("هذه آخر حلقة!");
  };
  if (dlBtn && currentEp?.download_url) {
    dlBtn.onclick = () => window.open(currentEp.download_url, "_blank");
  }
}

window.openEpisode = function(id) {
  window.location.href = `episode.html?ep=${id}`;
};

loadEpisode();
