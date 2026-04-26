import { supabase } from "../backend/supabase.js";   // ✅ مسار مصلح

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else window.location.href = "../index.html";
}

export async function register(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("✅ تم إنشاء الحساب، راجع إيميلك");
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "../index.html";
}
