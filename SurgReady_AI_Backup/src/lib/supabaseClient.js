import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vallyqjrhlaxvjgjeeki.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

/**
 * Check whether Supabase environment variables are configured with a valid live project key
 */
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseKey) return false;
  const isDummyUrl =
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl.includes('example.com') ||
    supabaseUrl === 'https://.supabase.co';
  const isDummyKey =
    supabaseKey.includes('your-supabase-') ||
    supabaseKey.includes('placeholder') ||
    supabaseKey.length < 25;
  return !isDummyUrl && !isDummyKey;
};

if (!isSupabaseConfigured()) {
  console.info(
    '[SurgReady AI Supabase] Project URL configured as: ' +
      supabaseUrl +
      '. To connect live, set VITE_SUPABASE_PUBLISHABLE_KEY in .env.'
  );
}

// Client initialization with fallback dummy credentials to prevent library constructor throws
export const supabase = createClient(
  supabaseUrl,
  isSupabaseConfigured() ? supabaseKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Live Connection & Health Probe
 * Executes a safe, permitted read query to verify Supabase connectivity
 */
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      status: 'pending_configuration',
      message: 'Supabase publishable key is not set in .env. Application is in local fallback mode.',
    };
  }

  try {
    const { data, error, status } = await supabase
      .from('hospitals')
      .select('id, hospital_name')
      .limit(1);

    if (error) {
      return {
        connected: false,
        status: 'error',
        statusCode: status,
        message: error.message,
        details: error.details || error.hint || null,
      };
    }

    return {
      connected: true,
      status: 'online',
      statusCode: status,
      sampleData: data,
      message: 'Supabase connection verified successfully.',
    };
  } catch (err) {
    return {
      connected: false,
      status: 'network_error',
      message: err.message || 'Unable to reach Supabase API.',
    };
  }
};
