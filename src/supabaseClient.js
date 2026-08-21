import { createClient } from "@supabase/supabase-js";

// These come from Vite environment variables (see .env.local for local dev,
// and Vercel's Environment Variables settings for the deployed site).
// Both are safe to expose in frontend code — the anon key is designed for
// public/browser use and is restricted by the table's row-level security
// policies, not by secrecy.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabaseConfigured = !!supabase;
