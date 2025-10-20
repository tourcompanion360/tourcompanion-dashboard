/**
 * Test Simple Dashboard Hook
 * This script tests the simple dashboard hook logic
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

const userId = 'fdc63ea1-081c-4ade-8097-ca6d4b4ba258';

async function testSimpleHook() {
  console.log('🔍 Testing Simple Dashboard Hook Logic...');
  console.log(`User ID: ${userId}`);

  try {
    // Step 1: Get creator
    console.log('\n1. Fetching creator...');
    const { data: creatorData, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (creatorError) {
      console.error('❌ Creator fetch error:', creatorError);
      return;
    }

    console.log('✅ Creator fetched:', creatorData.agency_name);

    // Step 2: Get clients
    console.log('\n2. Fetching clients...');
    const { data: clientsData, error: clientsError } = await supabase
      .from('end_clients')
      .select('*')
      .eq('creator_id', creatorData.id);

    if (clientsError) {
      console.error('❌ Clients fetch error:', clientsError);
      return;
    }

    console.log('✅ Clients fetched:', clientsData?.length || 0);

    // Step 3: Get projects
    console.log('\n3. Fetching projects...');
    const clientIds = clientsData?.map(c => c.id) || [];
    let projectsData = [];
    
    if (clientIds.length > 0) {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('end_client_id', clientIds);

      if (projectsError) {
        console.error('❌ Projects fetch error:', projectsError);
        return;
      }

      projectsData = projects || [];
    }

    console.log('✅ Projects fetched:', projectsData.length);

    // Step 4: Get chatbots
    console.log('\n4. Fetching chatbots...');
    const projectIds = projectsData.map(p => p.id);
    let chatbotsData = [];
    
    if (projectIds.length > 0) {
      const { data: chatbots, error: chatbotsError } = await supabase
        .from('chatbots')
        .select('*')
        .in('project_id', projectIds);

      if (chatbotsError) {
        console.warn('⚠️ Chatbots fetch failed:', chatbotsError.message);
      } else {
        chatbotsData = chatbots || [];
      }
    }

    console.log('✅ Chatbots fetched:', chatbotsData.length);

    // Step 5: Get analytics
    console.log('\n5. Fetching analytics...');
    let analyticsData = [];
    
    if (projectIds.length > 0) {
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .in('project_id', projectIds);

      if (analyticsError) {
        console.warn('⚠️ Analytics fetch failed:', analyticsError.message);
      } else {
        analyticsData = analytics || [];
      }
    }

    console.log('✅ Analytics fetched:', analyticsData.length);

    // Display results
    console.log('\n📊 Final Results:');
    console.log('   Creator:', creatorData.agency_name);
    console.log('   Clients:', clientsData?.length || 0);
    console.log('   Projects:', projectsData.length);
    console.log('   Chatbots:', chatbotsData.length);
    console.log('   Analytics:', analyticsData.length);

    if (clientsData && clientsData.length > 0) {
      console.log('\n📋 Client Details:');
      clientsData.forEach((client, index) => {
        const clientProjects = projectsData.filter(p => p.end_client_id === client.id);
        console.log(`   ${index + 1}. ${client.name} (${client.company})`);
        console.log(`      Projects: ${clientProjects.length}`);
        clientProjects.forEach(project => {
          const projectChatbots = chatbotsData.filter(cb => cb.project_id === project.id);
          console.log(`        - ${project.title} (${project.status}) - ${projectChatbots.length} chatbots`);
        });
      });
    }

    console.log('\n🎉 Simple hook test completed successfully!');
    console.log('   The dashboard should now display all this data.');
    console.log('   Open http://localhost:8080 in your browser to see it.');

  } catch (error) {
    console.error('🚨 Unexpected error during simple hook test:', error.message);
  }
}

testSimpleHook();


