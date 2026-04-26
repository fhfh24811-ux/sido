import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const SUPABASE_URL  = "https://avpbdqcdrwmcglfrymap.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cGJkcWNkcndtY2dsZnJ5bWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDU3ODcsImV4cCI6MjA3NjcyMTc4N30.QNTpG-k_F_x3MTRewG17JWWlhB0HRHd5sFyzCu1pEJ0";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
