// Supabase client configuration with environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug configuration in development
if (import.meta.env.DEV) {
  console.log('🔍 Supabase Configuration:', {
    url: SUPABASE_URL,
    keyPrefix: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'missing',
    source: 'ENVIRONMENT_VARIABLES',
    note: 'Using environment variables from .env.local',
    envUrl: import.meta.env.VITE_SUPABASE_URL,
    envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing',
  });
}

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required Supabase environment variables. Please check your .env file.');
  throw new Error('Missing required Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with configuration
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': `tourcompanion-${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      },
    },
  }
);

// Log connection info in development (URL sanitized for security)
if (import.meta.env.DEV) {
  console.log('🔗 Supabase client initialized:', {
    url: SUPABASE_URL ? '***configured***' : '***missing***',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  });
  
  // Test connection and refresh schema cache
  console.log('🔍 Testing Supabase connection...');
  console.log('🔍 Project URL:', SUPABASE_URL);
  console.log('🔍 Key prefix:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'missing');
  console.log('🔍 Using environment variables from .env.local');
  
  supabase.from('creators').select('count').limit(1).then(({ error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('Error details:', error);
      console.error('Error code:', error.code);
      console.error('Error hint:', error.hint);
      
      // Try to refresh schema cache by running a simple query
      supabase.rpc('version').then(({ error: rpcError }) => {
        if (rpcError) {
          console.error('❌ Schema cache refresh failed:', rpcError.message);
          console.error('This suggests a fundamental connection issue');
        } else {
          console.log('✅ Schema cache refreshed, retrying creators table...');
          // Retry the creators table query
          supabase.from('creators').select('count').limit(1).then(({ error: retryError }) => {
            if (retryError) {
              console.error('❌ Creators table still not accessible:', retryError.message);
            } else {
              console.log('✅ Creators table now accessible after cache refresh');
            }
          });
        }
      });
    } else {
      console.log('✅ Supabase connection test successful');
      console.log('✅ Creators table is accessible');
    }
  }).catch((err) => {
    console.error('❌ Supabase connection test error:', err);
  });
}

// Export for easy importing
// Usage: import { supabase } from "@/integrations/supabase/client";