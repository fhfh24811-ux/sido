import { supabase } from "../backend/supabase.js";
import { getTotalPoints, displayPoints } from "./points.js";

async function loadAccount() {
  // ✅ مصلح: كان يستخدم localStorage بشكل خاطئ
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    window.location.href = "login.html";
    return;
  }
  const user = data.user;

  // جلب الملف الشخصي
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const username = profile?.username || user.email?.split("@")[0] || "مستخدم";

  // عرض البيانات
  const nameEl  = document.getElementById("user-name");
  const emailEl = document.getElementById("user-email");
  const ptsEl   = document.getElementById("points");

  if (nameEl)  nameEl.textContent  = username;
  if (emailEl) emailEl.textContent = user.email;

  // جلب وعرض النقاط
  const total = await getTotalPoints(user.id);
  if (ptsEl) ptsEl.textContent = "رصيد النقاط: " + total + " ⭐";

  // سجل النقاط الأخير
  await loadPointsLog(user.id);
}

async function loadPointsLog(userId) {
  const container = document.getElementById("points-log");
  if (!container) return;

  const { data } = await supabase
    .from("points_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const labels = {
    watch: "مشاهدة حلقة 📺",
    daily_login: "دخول يومي 📅",
    signup_bonus: "مكافأة انضمام 🎁",
    referral: "إحالة صديق 👥",
    redeem: "استبدال مكافأة 🎁"
  };

  container.innerHTML = (data || []).length
    ? (data || []).map(r => `
        <div class="log-item">
          <span>${labels[r.type] || r.type}</span>
          <span class="${r.amount > 0 ? 'pos' : 'neg'}">${r.amount > 0 ? '+' : ''}${r.amount} ⭐</span>
        </div>`).join("")
    : "<p>لا توجد سجلات بعد</p>";
}

window.logout = async function() {
  await supabase.auth.signOut();
  window.location.href = "../index.html";
};

loadAccount();
