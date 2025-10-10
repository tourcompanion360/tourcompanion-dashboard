import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProvisionPayload {
  end_client: {
    email: string;
    name: string;
    company: string;
    phone?: string;
    website?: string;
  };
  project: {
    title: string;
    description?: string;
    project_type?: 'virtual_tour' | '3d_showcase' | 'interactive_map';
    external_tour_id?: string;
  };
  chatbot: {
    name: string;
    language?: string;
    welcome_message?: string;
    knowledge_base_text?: string;
  };
  inviteEndClient?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client (for auth)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client (for admin operations)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      throw new Error("Not authenticated");
    }

    // Get the payload
    const body = (await req.json()) as ProvisionPayload;

    // Find the creator record
    const { data: creator, error: creatorErr } = await adminClient
      .from("creators")
      .select("id, subscription_plan")
      .eq("user_id", user.id)
      .single();

    if (creatorErr || !creator) {
      throw new Error("Creator profile not found");
    }

    console.log("Provisioning for creator:", creator.id);

    // Step 1: Upsert end client
    const { data: endClient, error: endClientErr } = await adminClient
      .from("end_clients")
      .upsert(
        {
          email: body.end_client.email,
          name: body.end_client.name,
          company: body.end_client.company,
          phone: body.end_client.phone || null,
          website: body.end_client.website || null,
          creator_id: creator.id,
          status: 'active',
        },
        { onConflict: 'creator_id,email', ignoreDuplicates: false }
      )
      .select("id, email, name")
      .single();

    if (endClientErr) {
      console.error("End client error:", endClientErr);
      throw new Error(`Failed to create end client: ${endClientErr.message}`);
    }

    console.log("End client created:", endClient.id);

    // Step 2: Create project
    const { data: project, error: projectErr } = await adminClient
      .from("projects")
      .insert({
        end_client_id: endClient.id,
        title: body.project.title,
        description: body.project.description || null,
        project_type: body.project.project_type || 'virtual_tour',
        external_tour_id: body.project.external_tour_id || null,
        status: 'active',
      })
      .select("id, title")
      .single();

    if (projectErr) {
      console.error("Project error:", projectErr);
      throw new Error(`Failed to create project: ${projectErr.message}`);
    }

    console.log("Project created:", project.id);

    // Step 3: Create chatbot
    const { data: chatbot, error: chatbotErr } = await adminClient
      .from("chatbots")
      .insert({
        project_id: project.id,
        name: body.chatbot.name,
        language: body.chatbot.language || 'english',
        welcome_message: body.chatbot.welcome_message || 'Hello! How can I help you today?',
        knowledge_base_text: body.chatbot.knowledge_base_text || null,
        status: 'active',
      })
      .select("id, name")
      .single();

    if (chatbotErr) {
      console.error("Chatbot error:", chatbotErr);
      throw new Error(`Failed to create chatbot: ${chatbotErr.message}`);
    }

    console.log("Chatbot created:", chatbot.id);

    // Step 4: Optionally invite end client portal user
    let magicLink: string | null = null;
    let portalAuthCreated = false;

    if (body.inviteEndClient) {
      try {
        // Create or invite auth user
        const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
          body.end_client.email,
          {
            data: {
              role: 'end_client',
              name: body.end_client.name,
              company: body.end_client.company,
            },
          }
        );

        if (inviteErr) {
          console.error("Invite error:", inviteErr);
        } else if (inviteData?.user) {
          // Map auth user to end client
          const { error: mappingErr } = await adminClient
            .from("end_client_users")
            .upsert({
              auth_user_id: inviteData.user.id,
              end_client_id: endClient.id,
              email: body.end_client.email,
            }, { onConflict: 'auth_user_id' });

          if (mappingErr) {
            console.error("Mapping error:", mappingErr);
          } else {
            portalAuthCreated = true;
            
            // Generate magic link
            const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
              type: 'magiclink',
              email: body.end_client.email,
            });

            if (!linkErr && linkData?.properties?.action_link) {
              magicLink = linkData.properties.action_link;
            }
          }
        }
      } catch (inviteError) {
        console.error("Portal invite failed:", inviteError);
        // Continue anyway - portal can be set up later
      }
    }

    // Return success response
    const portalUrl = `${supabaseUrl.replace('https://', 'https://app.')}/client/${project.id}`;
    
    return new Response(
      JSON.stringify({
        success: true,
        end_client_id: endClient.id,
        end_client_name: endClient.name,
        project_id: project.id,
        project_title: project.title,
        chatbot_id: chatbot.id,
        chatbot_name: chatbot.name,
        portal_url: portalUrl,
        portal_auth_created: portalAuthCreated,
        magic_link: magicLink,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Provision error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});



