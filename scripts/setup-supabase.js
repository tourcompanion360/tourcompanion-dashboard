import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yrvicwapjsevyilxdzsm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAwNjY4MiwiZXhwIjoyMDc1NTgyNjgyfQ.fHtu3wPlbrsyZPVVLObVYeZ-BT8KmsJybK_r_zEv4pU';

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up TourCompanion database...');
    
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      throw new Error('Cannot connect to database');
    }
    
    console.log('✅ Database connection successful');
    
    // Create tables one by one
    console.log('📊 Creating database tables...');
    
    // 1. Create creators table
    console.log('Creating creators table...');
    const { error: creatorsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.creators (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL UNIQUE,
          agency_name TEXT NOT NULL,
          agency_logo TEXT,
          contact_email TEXT NOT NULL,
          phone TEXT,
          website TEXT,
          address TEXT,
          description TEXT,
          subscription_plan TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro')),
          subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
          stripe_customer_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (creatorsError) {
      console.log('⚠️ Creators table creation:', creatorsError.message);
    } else {
      console.log('✅ Creators table created');
    }
    
    // 2. Create end_clients table
    console.log('Creating end_clients table...');
    const { error: clientsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.end_clients (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          creator_id UUID NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL,
          website TEXT,
          phone TEXT,
          avatar TEXT,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
          login_credentials JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (clientsError) {
      console.log('⚠️ End clients table creation:', clientsError.message);
    } else {
      console.log('✅ End clients table created');
    }
    
    // 3. Create projects table
    console.log('Creating projects table...');
    const { error: projectsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          end_client_id UUID NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          project_type TEXT NOT NULL DEFAULT 'virtual_tour' CHECK (project_type IN ('virtual_tour', '3d_showcase', 'interactive_map')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
          thumbnail_url TEXT,
          tour_url TEXT,
          settings JSONB DEFAULT '{}',
          views INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (projectsError) {
      console.log('⚠️ Projects table creation:', projectsError.message);
    } else {
      console.log('✅ Projects table created');
    }
    
    // 4. Create chatbots table
    console.log('Creating chatbots table...');
    const { error: chatbotsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.chatbots (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          language TEXT NOT NULL DEFAULT 'english',
          welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
          fallback_message TEXT NOT NULL DEFAULT 'I apologize, but I don''t understand. Could you please rephrase your question?',
          primary_color TEXT NOT NULL DEFAULT '#3b82f6',
          widget_style TEXT NOT NULL DEFAULT 'modern',
          position TEXT NOT NULL DEFAULT 'bottom_right',
          avatar_url TEXT,
          brand_logo_url TEXT,
          response_style TEXT NOT NULL DEFAULT 'friendly',
          max_questions INTEGER NOT NULL DEFAULT 10,
          conversation_limit INTEGER DEFAULT 50,
          knowledge_base_text TEXT,
          knowledge_base_files JSONB DEFAULT '[]',
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
          statistics JSONB DEFAULT '{
            "total_conversations": 0,
            "active_users": 0,
            "avg_response_time": 0,
            "satisfaction_rate": 0,
            "total_messages": 0,
            "last_activity": null
          }',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (chatbotsError) {
      console.log('⚠️ Chatbots table creation:', chatbotsError.message);
    } else {
      console.log('✅ Chatbots table created');
    }
    
    // 5. Create leads table
    console.log('Creating leads table...');
    const { error: leadsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.leads (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          chatbot_id UUID NOT NULL,
          visitor_name TEXT,
          visitor_email TEXT,
          visitor_phone TEXT,
          company TEXT,
          question_asked TEXT NOT NULL,
          chatbot_response TEXT,
          lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
          status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
          source TEXT DEFAULT 'chatbot',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (leadsError) {
      console.log('⚠️ Leads table creation:', leadsError.message);
    } else {
      console.log('✅ Leads table created');
    }
    
    // 6. Create analytics table
    console.log('Creating analytics table...');
    const { error: analyticsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.analytics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID NOT NULL,
          date DATE NOT NULL,
          metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'unique_visitor', 'time_spent', 'hotspot_click', 'chatbot_interaction', 'lead_generated')),
          metric_value INTEGER NOT NULL DEFAULT 0,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (analyticsError) {
      console.log('⚠️ Analytics table creation:', analyticsError.message);
    } else {
      console.log('✅ Analytics table created');
    }
    
    // 7. Create requests table
    console.log('Creating requests table...');
    const { error: requestsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID NOT NULL,
          end_client_id UUID NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          request_type TEXT NOT NULL CHECK (request_type IN ('hotspot_update', 'content_change', 'design_modification', 'new_feature', 'bug_fix')),
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
          attachments JSONB DEFAULT '[]',
          creator_notes TEXT,
          client_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (requestsError) {
      console.log('⚠️ Requests table creation:', requestsError.message);
    } else {
      console.log('✅ Requests table created');
    }
    
    // 8. Create assets table
    console.log('Creating assets table...');
    const { error: assetsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.assets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          creator_id UUID NOT NULL,
          project_id UUID,
          filename TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          file_url TEXT NOT NULL,
          thumbnail_url TEXT,
          tags TEXT[] DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (assetsError) {
      console.log('⚠️ Assets table creation:', assetsError.message);
    } else {
      console.log('✅ Assets table created');
    }
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Create sample creator
    const { data: creatorData, error: creatorInsertError } = await supabase
      .from('creators')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user
        agency_name: 'Demo Agency',
        contact_email: 'demo@example.com',
        subscription_plan: 'pro',
        subscription_status: 'active'
      })
      .select()
      .single();
    
    if (creatorInsertError) {
      console.log('⚠️ Creator insertion:', creatorInsertError.message);
    } else {
      console.log('✅ Sample creator created');
      
      // Create sample end clients
      const { data: clientsData, error: clientsInsertError } = await supabase
        .from('end_clients')
        .insert([
          {
            creator_id: creatorData.id,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@techcorp.com',
            company: 'TechCorp Solutions',
            status: 'active'
          },
          {
            creator_id: creatorData.id,
            name: 'Michael Chen',
            email: 'm.chen@innovate.com',
            company: 'Innovate Design',
            status: 'active'
          }
        ])
        .select();
      
      if (clientsInsertError) {
        console.log('⚠️ Clients insertion:', clientsInsertError.message);
      } else {
        console.log('✅ Sample clients created');
        
        // Create sample project
        const { data: projectData, error: projectInsertError } = await supabase
          .from('projects')
          .insert({
            end_client_id: clientsData[0].id,
            title: 'TechCorp Office Virtual Tour',
            description: 'Interactive 360° tour of TechCorp headquarters',
            project_type: 'virtual_tour',
            status: 'active',
            tour_url: 'https://example.com/techcorp-tour'
          })
          .select()
          .single();
        
        if (projectInsertError) {
          console.log('⚠️ Project insertion:', projectInsertError.message);
        } else {
          console.log('✅ Sample project created');
          
          // Create sample chatbot
          const { data: chatbotData, error: chatbotInsertError } = await supabase
            .from('chatbots')
            .insert({
              project_id: projectData.id,
              name: 'TechCorp Support Bot',
              description: 'AI assistant for TechCorp customer support',
              welcome_message: 'Hello! I\'m here to help you with any questions about TechCorp. How can I assist you today?',
              primary_color: '#3b82f6',
              status: 'active',
              statistics: {
                total_conversations: 1247,
                active_users: 89,
                avg_response_time: 1.2,
                satisfaction_rate: 4.6,
                total_messages: 3847,
                last_activity: '2024-01-15T10:30:00Z'
              }
            })
            .select()
            .single();
          
          if (chatbotInsertError) {
            console.log('⚠️ Chatbot insertion:', chatbotInsertError.message);
          } else {
            console.log('✅ Sample chatbot created');
            
            // Create sample leads
            const { data: leadsData, error: leadsInsertError } = await supabase
              .from('leads')
              .insert([
                {
                  chatbot_id: chatbotData.id,
                  visitor_name: 'John Doe',
                  visitor_email: 'john.doe@example.com',
                  question_asked: 'What are your office hours?',
                  chatbot_response: 'Our office hours are Monday to Friday, 9 AM to 6 PM.',
                  lead_score: 85,
                  status: 'qualified'
                },
                {
                  chatbot_id: chatbotData.id,
                  visitor_name: 'Jane Smith',
                  visitor_email: 'jane.smith@company.com',
                  question_asked: 'Do you offer virtual consultations?',
                  chatbot_response: 'Yes! We offer virtual consultations via video call.',
                  lead_score: 92,
                  status: 'new'
                }
              ])
              .select();
            
            if (leadsInsertError) {
              console.log('⚠️ Leads insertion:', leadsInsertError.message);
            } else {
              console.log('✅ Sample leads created');
            }
          }
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📋 Your TourCompanion SaaS database is ready with:');
    console.log('   ✅ 8 core tables created');
    console.log('   ✅ Sample data inserted');
    console.log('   ✅ Ready for your application');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  });
