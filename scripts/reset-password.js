/**
 * Reset Password for Test User
 * This script resets the password for the test user
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are not set. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUser = {
  email: 'samirechchttioui@gmail.com',
  password: 'test123456',
};

async function resetPassword() {
  console.log('🔍 Resetting Password for Test User...');
  console.log(`Email: ${testUser.email}`);

  try {
    // Try to reset password
    console.log('\n1. Sending password reset email...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(testUser.email, {
      redirectTo: 'http://localhost:8087/auth/reset-password',
    });

    if (resetError) {
      console.error('❌ Password reset failed:', resetError.message);
      return;
    }

    console.log('✅ Password reset email sent successfully!');
    console.log('   Check your email for the reset link.');
    console.log('   Or try signing in with a different password.');

    // Try different common passwords
    console.log('\n2. Trying common passwords...');
    const commonPasswords = ['password', '123456', 'admin', 'test', 'password123'];
    
    for (const password of commonPasswords) {
      console.log(`   Trying password: ${password}`);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: password,
      });

      if (!authError && authData.user) {
        console.log(`✅ Success! Password is: ${password}`);
        console.log('   User ID:', authData.user.id);
        console.log('   Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
        return;
      }
    }

    console.log('❌ None of the common passwords worked.');
    console.log('   Please check your email for the password reset link.');

  } catch (error) {
    console.error('🚨 Unexpected error during password reset:', error.message);
  }
}

resetPassword();


