import { supabase } from "./supabase.js";

// جلب الإعلانات حسب الموضع
export async function getAds(placement = "banner") {
  const { data, error } = await supabase.from("ads").select("*").eq("placement", placement).eq("active", true);
  if (error) { console.error(error.message); return []; }
  return data || [];
}

// تسجيل نقرة على إعلان
export async function logAdClick(adId, userId = null) {
  await supabase.from("ad_clicks").insert({ ad_id: adId, user_id: userId });
}
