/**
 * Simple Authentication Test
 * Tests authentication without requiring service role key
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

async function testAuth() {
  console.log('🔍 Testing Authentication...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Test User: ${testUser.email}`);

  try {
    // Test authentication
    console.log('\n1. Testing sign in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.log('\n🔧 Let\'s try to create the user...');
      
      // Try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            full_name: 'Samir Echchttioui',
            is_developer: true,
            agency_name: 'Test Agency'
          }
        }
      });

      if (signUpError) {
        console.error('❌ Sign up failed:', signUpError.message);
        return;
      }

      console.log('✅ User created successfully!');
      console.log('   User ID:', signUpData.user?.id);
      console.log('   Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
      
      if (!signUpData.user?.email_confirmed_at) {
        console.log('⚠️  Email not confirmed. You may need to check your email or use a different approach.');
      }
      
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');

    // Test creator profile fetch
    console.log('\n2. Testing creator profile fetch...');
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select(`
        *,
        end_clients(
          id,
          name,
          email,
          company,
          status,
          projects(
            id,
            title,
            status,
            views,
            created_at
          )
        )
      `)
      .eq('user_id', authData.user.id)
      .single();

    if (creatorError) {
      console.error('❌ Creator profile fetch failed:', creatorError.message);
      return;
    }

    console.log('✅ Creator profile fetched successfully!');
    console.log('   Agency:', creatorData.agency_name);
    console.log('   Email:', creatorData.contact_email);
    console.log('   Clients count:', creatorData.end_clients?.length || 0);

    // Test data extraction
    console.log('\n3. Testing data extraction...');
    const clients = creatorData.end_clients || [];
    const projects = clients.flatMap(client => client.projects || []);
    
    console.log('✅ Data extraction successful!');
    console.log('   Total clients:', clients.length);
    console.log('   Total projects:', projects.length);
    
    if (clients.length > 0) {
      console.log('\n📊 Client Details:');
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.name} (${client.company})`);
        console.log(`      Projects: ${client.projects?.length || 0}`);
        if (client.projects && client.projects.length > 0) {
          client.projects.forEach(project => {
            console.log(`        - ${project.title} (${project.status})`);
          });
        }
      });
    }

    console.log('\n🎉 Authentication and data test completed successfully!');
    console.log('   The dashboard should now display all your data.');

  } catch (error) {
    console.error('🚨 Unexpected error during auth test:', error.message);
  }
}

testAuth();


