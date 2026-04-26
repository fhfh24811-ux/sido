import { supabase } from "../backend/supabase.js";

// ✅ إضافة نقاط - مصلح (كان يستخدم localStorage بشكل خاطئ)
export async function addPoints(userId, amount, type = "watch", note = "") {
  // إذا لم يُعطَ userId، جلبه من supabase مباشرة
  if (!userId) {
    const { data } = await supabase.auth.getUser();
    userId = data?.user?.id;
  }
  if (!userId) { console.error("المستخدم غير مسجل"); return; }

  const { error } = await supabase.from("points_log").insert({
    user_id: userId,
    amount,
    type,
    note,
    created_at: new Date().toISOString()
  });

  if (error) { console.error("خطأ في إضافة النقاط:", error.message); }
  else {
    // تحديث الواجهة إذا كان عنصر النقاط موجوداً
    const el = document.getElementById("user-points-display");
    if (el) el.textContent = parseInt(el.textContent || "0") + amount;
    console.log("⭐ تمت إضافة النقاط:", amount);
  }
}

// جلب إجمالي النقاط
export async function getTotalPoints(userId) {
  if (!userId) {
    const { data } = await supabase.auth.getUser();
    userId = data?.user?.id;
  }
  if (!userId) return 0;

  const { data, error } = await supabase.from("points_log").select("amount").eq("user_id", userId);
  if (error) { console.error(error.message); return 0; }
  return (data || []).reduce((s, r) => s + (r.amount || 0), 0);
}

// عرض رصيد النقاط في أي عنصر
export async function displayPoints(elementId = "user-points-display") {
  const total = await getTotalPoints();
  const el = document.getElementById(elementId);
  if (el) el.textContent = total;
  return total;
}

// استبدال نقاط بمكافأة
export async function redeemPoints(cost, rewardName) {
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) { alert("يجب تسجيل الدخول أولاً"); return false; }

  const total = await getTotalPoints(userId);
  if (total < cost) {
    alert(`❌ نقاطك غير كافية! عندك ${total} ⭐ وتحتاج ${cost} ⭐`);
    return false;
  }

  await addPoints(userId, -cost, "redeem", rewardName);
  alert(`🎉 تم! استمتع بـ "${rewardName}"`);
  return true;
}
