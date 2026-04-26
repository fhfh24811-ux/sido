// ✅ مصلح: كان يكسر الصفحة إذا العناصر غير موجودة
const qualityBtn = document.querySelector(".quality-btn");
const menu       = document.querySelector(".quality-menu");
const video      = document.getElementById("video");

if (qualityBtn && menu) {
  qualityBtn.onclick = () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  };
}

if (menu && video) {
  document.querySelectorAll(".quality-menu button").forEach(btn => {
    btn.onclick = () => {
      const q = btn.dataset.q;
      const t = video.currentTime;
      video.src = video.src.replace(/_\d+p\./, `_${q}p.`);
      video.currentTime = t;
      video.play();
      menu.style.display = "none";
    };
  });
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener("click", (e) => {
  if (menu && qualityBtn && !qualityBtn.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }
});
