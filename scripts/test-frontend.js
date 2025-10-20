/**
 * Test Frontend Data Loading
 * This script tests if the frontend can load data properly
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
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendData() {
  console.log('🔍 Testing Frontend Data Loading...');
  console.log(`Server should be running on: http://localhost:8080`);
  console.log(`Supabase URL: ${supabaseUrl}`);

  try {
    // Test the exact query that the frontend uses
    console.log('\n1. Testing creator data fetch (same as frontend)...');
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select(`
        *,
        end_clients(
          id,
          name,
          email,
          company,
          website,
          phone,
          avatar,
          status,
          created_at,
          updated_at,
          projects(
            id,
            title,
            description,
            project_type,
            status,
            thumbnail_url,
            tour_url,
            settings,
            views,
            created_at,
            updated_at,
            chatbots(
              id,
              name,
              description,
              language,
              welcome_message,
              fallback_message,
              primary_color,
              widget_style,
              position,
              avatar_url,
              brand_logo_url,
              response_style,
              max_questions,
              conversation_limit,
              knowledge_base_text,
              knowledge_base_files,
              status,
              statistics,
              created_at,
              updated_at
            )
          )
        )
      `)
      .eq('user_id', 'fdc63ea1-081c-4ade-8097-ca6d4b4ba258') // Use the actual user ID
      .single();

    if (creatorError) {
      console.error('❌ Creator data fetch failed:', creatorError.message);
      return;
    }

    console.log('✅ Creator data fetched successfully!');
    console.log('   Agency:', creatorData.agency_name);
    console.log('   Email:', creatorData.contact_email);
    console.log('   Clients count:', creatorData.end_clients?.length || 0);

    // Test data extraction (same as frontend)
    console.log('\n2. Testing data extraction (same as frontend)...');
    const clients = creatorData.end_clients || [];
    const projects = clients.flatMap(client => client.projects || []);
    const chatbots = projects.flatMap(project => project.chatbots || []);
    
    console.log('✅ Data extraction successful!');
    console.log('   Total clients:', clients.length);
    console.log('   Total projects:', projects.length);
    console.log('   Total chatbots:', chatbots.length);
    
    if (clients.length > 0) {
      console.log('\n📊 Client Details:');
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.name} (${client.company})`);
        console.log(`      Projects: ${client.projects?.length || 0}`);
        if (client.projects && client.projects.length > 0) {
          client.projects.forEach(project => {
            console.log(`        - ${project.title} (${project.status})`);
            console.log(`          Chatbots: ${project.chatbots?.length || 0}`);
          });
        }
      });
    }

    console.log('\n🎉 Frontend data test completed successfully!');
    console.log('   The dashboard should now display all this data.');
    console.log('   Open http://localhost:8080 in your browser to see it.');

  } catch (error) {
    console.error('🚨 Unexpected error during frontend test:', error.message);
  }
}

testFrontendData();


