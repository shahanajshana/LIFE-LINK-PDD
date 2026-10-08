import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === "https://your-project-id.supabase.co") {
  console.error(
    "⚠️  Supabase URL missing or is still a placeholder!\n" +
    "   Open frontend/.env and set REACT_APP_SUPABASE_URL to your project URL.\n" +
    "   Find it at: https://supabase.com → Project Settings → API"
  );
}

if (!supabaseAnonKey || supabaseAnonKey === "your-anon-public-key-here") {
  console.error(
    "⚠️  Supabase anon key missing or is still a placeholder!\n" +
    "   Open frontend/.env and set REACT_APP_SUPABASE_ANON_KEY.\n" +
    "   Find it at: https://supabase.com → Project Settings → API"
  );
}

export const supabase = createClient(
  supabaseUrl     || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      // Persist session in localStorage so the user stays logged in on refresh
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: true,
    },
  }
);
