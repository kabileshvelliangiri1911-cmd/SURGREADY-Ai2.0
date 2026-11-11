import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  const isDummyUrl =
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('example.com') ||
    supabaseUrl === 'https://.supabase.co';
  const isDummyKey =
    supabaseAnonKey.includes('your-supabase-anon-key') ||
    supabaseAnonKey.includes('placeholder') ||
    supabaseAnonKey.length < 25;
  return !isDummyUrl && !isDummyKey;
};

if (!isSupabaseConfigured()) {
  console.info(
    '[SurgReady AI] Supabase credentials in .env are in demo/placeholder mode. To connect to your live Supabase cloud project, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Client initialization with fallback dummy credentials to prevent library constructor throws
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key'
);
