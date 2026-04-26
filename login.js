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

// ✅ دالة واحدة فقط مربوطة بـ Supabase (حُذفت الدوال الوهمية)
window.login = async function() {
  const email = document.getElementById("email")?.value.trim();
  const pass  = document.getElementById("password")?.value.trim();

  if (!email || !pass) { alert("الرجاء إدخال الإيميل وكلمة المرور"); return; }

  const btn = document.querySelector(".login-btn");
  if (btn) { btn.textContent = "جاري..."; btn.disabled = true; }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

  if (btn) { btn.textContent = "دخول"; btn.disabled = false; }

  if (error) {
    alert("❌ " + error.message);
  } else {
    // نقاط الدخول اليومي
    await addPoints(data.user.id, 50, "daily_login");
    window.location.href = "../index.html";
  }
};
