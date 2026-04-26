import { supabase } from "./supabase.js";

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  return !error;
}

export async function getUserPoints(userId) {
  const { data, error } = await supabase
    .from("points_log")
    .select("amount")
    .eq("user_id", userId);
  if (error) return 0;
  return (data || []).reduce((s, r) => s + (r.amount || 0), 0);
}

export async function addToWatchlist(userId, animeId) {
  const { error } = await supabase
    .from("watchlist")
    .upsert({ user_id: userId, anime_id: animeId });
  return !error;
}

export async function removeFromWatchlist(userId, animeId) {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("anime_id", animeId);
  return !error;
}

export async function getWatchlist(userId) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("anime_id, animes(id, name, image, genre, rating, status)")
    .eq("user_id", userId);
  if (error) return [];
  return (data || []).map(r => r.animes).filter(Boolean);
}
