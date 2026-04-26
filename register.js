import { supabase } from "../backend/supabase.js";
import { addPoints } from "./points.js";

// حركة الكارت 3D (بقاء الميزة الأصلية)
const card = document.getElementById("card3d");
if (card) {
  document.addEventListener("mousemove", (e) => {
    const xAxis = (window.innerWidth / 2 - e.clientX) / 25;
    const yAxis = (window.innerHeight / 2 - e.clientY) / 25;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  });
}

window.register = async function() {
  const username = document.getElementById("username")?.value.trim();
  const email    = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !email || !password) { alert("الرجاء إدخال جميع المعلومات"); return; }
  if (password.length < 6) { alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }

  const btn = document.querySelector(".login-btn");
  if (btn) { btn.textContent = "جاري الإنشاء..."; btn.disabled = true; }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (btn) { btn.textContent = "إنشاء الحساب"; btn.disabled = false; }

  if (error) { alert("❌ " + error.message); return; }

  if (data?.user) {
    // إنشاء الملف الشخصي
    await supabase.from("profiles").insert({ id: data.user.id, username, points: 0 }).catch(() => {});
    // مكافأة الانضمام
    await addPoints(data.user.id, 100, "signup_bonus", "مكافأة الانضمام");
  }

  alert("🎉 مرحباً " + username + "! تم إنشاء حسابك وحصلت على 100 نقطة مجاناً ⭐");
  window.location.href = "login.html";
};
