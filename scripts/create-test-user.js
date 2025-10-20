/**
 * Create Test User Script
 * Creates a test user account for development and testing
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

async function createTestUser() {
  const testUser = {
    email: 'samirechchttioui@gmail.com',
    password: 'test123456',
    fullName: 'Samir Echchttioui (Developer)'
  };

  try {
    console.log('🚀 Creating test user...');
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: testUser.fullName,
        is_developer: true,
        agency_name: 'Test Agency'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists in auth, checking creator profile...');
        
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === testUser.email);
        
        if (user) {
          await updateCreatorProfile(user.id, testUser.fullName);
        }
        return;
      }
      throw authError;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Create creator profile
    await createCreatorProfile(authData.user.id, testUser.fullName);

    console.log('🎉 Test user created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('👤 Full Name:', testUser.fullName);
    console.log('🔓 Access: Full (Developer Mode)');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

async function createCreatorProfile(userId, fullName) {
  const { error } = await supabase
    .from('creators')
    .insert({
      user_id: userId,
      full_name: fullName,
      agency_name: 'Test Agency',
      contact_email: 'samirechchttioui@gmail.com',
      is_tester: true, // Give full access
      subscription_status: 'active',
      subscription_plan: 'pro',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    if (error.message.includes('duplicate key')) {
      console.log('✅ Creator profile already exists, updating...');
      await updateCreatorProfile(userId, fullName);
    } else {
      throw error;
    }
  } else {
    console.log('✅ Creator profile created');
  }
}

async function updateCreatorProfile(userId, fullName) {
  const { error } = await supabase
    .from('creators')
    .update({
      full_name: fullName,
      agency_name: 'Test Agency',
      contact_email: 'samirechchttioui@gmail.com',
      is_tester: true,
      subscription_status: 'active',
      subscription_plan: 'pro',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
  
  console.log('✅ Creator profile updated with full access');
}

// Run the script
createTestUser();
