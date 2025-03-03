import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'taxai-auth-storage'
  },
  global: {
    fetch: (...args) => fetch(...args)
  },
  // Add retry logic for better reliability
  db: {
    schema: 'public'
  }
});

// Helper function to check if Supabase is available
export const checkSupabaseConnection = async () => {
  try {
    // Use a simpler query that's less likely to fail due to permissions
    const { error } = await supabase.from('tax_categories').select('id').limit(1);
    
    // If there's no error, the connection is working
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};