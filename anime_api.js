import { supabase } from "./supabase.js";

export async function getAllAnime() {
  const { data, error } = await supabase.from("animes").select("*").order("id", { ascending: false });
  if (error) { console.error(error.message); return []; }
  return data || [];
}
export async function getAnimeById(id) {
  const { data, error } = await supabase.from("animes").select("*").eq("id", id).single();
  if (error) { console.error(error.message); return null; }
  return data;
}
export async function searchAnime(query) {
  const { data, error } = await supabase.from("animes").select("*").ilike("name", `%${query}%`).limit(20);
  if (error) { console.error(error.message); return []; }
  return data || [];
}
export async function getEpisodes(animeId) {
  const { data, error } = await supabase.from("episodes").select("*").eq("anime_id", animeId).order("number", { ascending: true });
  if (error) { console.error(error.message); return []; }
  return data || [];
}
export async function getEpisode(epId) {
  const { data, error } = await supabase.from("episodes").select("*, animes(name, image, description, genre, rating, year)").eq("id", epId).single();
  if (error) { console.error(error.message); return null; }
  if (data?.animes) {
    data.anime_name = data.animes.name; data.anime_image = data.animes.image;
    data.anime_desc = data.animes.description; data.anime_genre = data.animes.genre;
    data.anime_rating = data.animes.rating; data.anime_year = data.animes.year;
    delete data.animes;
  }
  return data;
}
export async function getServers(episodeId) {
  const { data, error } = await supabase.from("servers").select("*").eq("episode_id", episodeId).order("id", { ascending: true });
  if (error) { console.warn("getServers:", error.message); return []; }
  return data || [];
}
