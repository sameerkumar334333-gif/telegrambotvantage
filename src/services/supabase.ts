import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.'
  );
}

// Prefer service_role for backend (bypasses RLS and avoids "permission denied" when policies/grants are strict)
// Fallback to anon key for compatibility (requires correct RLS + GRANTs).
const supabaseKey = config.supabaseServiceRoleKey || config.supabaseAnonKey;

export const supabase = createClient(config.supabaseUrl, supabaseKey);

