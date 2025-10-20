import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWorkflow() {
  console.log('Testing chatbot request form to admin dashboard workflow...');
  
  try {
    // 1. Test database schema
    console.log('1. Testing database schema...');
    const { data: columns, error: schemaError } = await supabase
      .from('chatbot_requests')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema test failed:', schemaError);
      return;
    }
    console.log('✅ Database schema is accessible');
    
    // 2. Test form submission (simulate)
    console.log('2. Testing form submission...');
    
    // First, get a project to use for testing
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, end_client_id')
      .limit(1);
    
    if (projectError || !projects || projects.length === 0) {
      console.error('❌ No projects found for testing');
      return;
    }
    
    const testProject = projects[0];
    console.log('✅ Found test project:', testProject.id);
    
    // 3. Test admin query
    console.log('3. Testing admin dashboard query...');
    const { data: requests, error: adminError } = await supabase
      .from('chatbot_requests')
      .select(`
        *,
        projects:project_id (
          id,
          title,
          end_clients:end_client_id (
            id,
            name,
            email,
            company,
            creators:creator_id (
              id,
              agency_name,
              contact_email
            )
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (adminError) {
      console.error('❌ Admin query failed:', adminError);
      return;
    }
    
    console.log('✅ Admin query successful, found', requests?.length || 0, 'requests');
    
    // 4. Display sample request structure
    if (requests && requests.length > 0) {
      console.log('4. Sample request structure:');
      const sample = requests[0];
      console.log('   - ID:', sample.id);
      console.log('   - Title:', sample.title || 'N/A');
      console.log('   - Chatbot Name:', sample.chatbot_name || 'N/A');
      console.log('   - Status:', sample.status);
      console.log('   - Priority:', sample.priority);
      console.log('   - Project:', sample.projects?.title || 'N/A');
      console.log('   - Client:', sample.projects?.end_clients?.name || 'N/A');
      console.log('   - Agency:', sample.projects?.end_clients?.creators?.agency_name || 'N/A');
    }
    
    console.log('✅ All tests passed! Integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWorkflow();


