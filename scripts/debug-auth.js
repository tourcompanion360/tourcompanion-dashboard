/**
 * Debug Authentication Script
 * Helps troubleshoot authentication issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAuth() {
  const testEmail = 'samirechchttioui@gmail.com';
  
  try {
    console.log('🔍 Debugging authentication...\n');
    
    // Check if user exists in auth
    console.log('1. Checking auth user...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === testEmail);
    if (user) {
      console.log('✅ Auth user found:', {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      });
    } else {
      console.log('❌ Auth user not found');
      return;
    }
    
    // Check creator profile
    console.log('\n2. Checking creator profile...');
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (creatorError) {
      console.error('❌ Error fetching creator profile:', creatorError.message);
    } else if (creator) {
      console.log('✅ Creator profile found:', {
        id: creator.id,
        user_id: creator.user_id,
        full_name: creator.full_name,
        agency_name: creator.agency_name,
        is_tester: creator.is_tester,
        subscription_status: creator.subscription_status,
        subscription_plan: creator.subscription_plan
      });
    } else {
      console.log('❌ Creator profile not found');
    }
    
    // Test sign in
    console.log('\n3. Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'test123456'
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful:', {
        user_id: signInData.user.id,
        email: signInData.user.email,
        session_exists: !!signInData.session
      });
    }
    
    // Check environment variables
    console.log('\n4. Environment variables:');
    console.log('VITE_DEV_MODE:', process.env.VITE_DEV_MODE);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugAuth();


