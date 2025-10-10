import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatPayload {
  chatbot_id: string;
  message: string;
  session_id?: string;
}

// Simple keyword-based response system (you can replace this with your own chatbot logic)
function generateSimpleResponse(
  userMessage: string,
  knowledgeBase: string,
  chatbotName: string
): string {
  const message = userMessage.toLowerCase();
  
  // Simple keyword matching - you can expand this with your own logic
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `Hello! I'm ${chatbotName}. How can I help you today?`;
  }
  
  if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
    return "For pricing information, please contact our team directly. I'd be happy to help you with other questions about our virtual tour!";
  }
  
  if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
    return "You can reach our team through the contact information provided in your portal. Is there anything specific about the virtual tour I can help you with?";
  }
  
  if (message.includes('tour') || message.includes('virtual') || message.includes('property')) {
    return "This virtual tour showcases our property with interactive features. You can explore different areas and get detailed information. What would you like to know more about?";
  }
  
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're welcome! Feel free to ask if you have any other questions about the virtual tour.";
  }
  
  // Default response
  return `I understand you're asking about "${userMessage}". While I'm still learning, I can help you with general questions about the virtual tour. For specific details, please contact our team directly.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const body = (await req.json()) as ChatPayload;

    // Get chatbot and project info
    const { data: chatbot, error: chatbotErr } = await adminClient
      .from("chatbots")
      .select("id, project_id, name, welcome_message, language, knowledge_base_text")
      .eq("id", body.chatbot_id)
      .single();

    if (chatbotErr || !chatbot) {
      throw new Error("Chatbot not found");
    }

    // Get knowledge base chunks for context (optional - you can use this for your own logic)
    const { data: similarChunks, error: searchErr } = await adminClient
      .from("kb_chunks")
      .select("content")
      .eq("project_id", chatbot.project_id)
      .limit(5);

    if (searchErr) {
      console.error("KB search error:", searchErr);
    }

    // Build context from KB chunks and chatbot knowledge base
    let context = chatbot.knowledge_base_text || "";
    if (similarChunks && similarChunks.length > 0) {
      const chunksText = similarChunks
        .map((chunk: any) => chunk.content)
        .join("\n---\n");
      context = `${context}\n\nRelevant information:\n${chunksText}`;
    }

    // Generate response using your own logic (replace this with your chatbot)
    const answer = generateSimpleResponse(
      body.message,
      context,
      chatbot.name
    );

    // Store user message in conversation history (no embedding needed)
    await adminClient.from("conversation_messages").insert({
      chatbot_id: body.chatbot_id,
      role: "user",
      content: body.message,
      metadata: { session_id: body.session_id || null },
    });

    // Store assistant response
    await adminClient.from("conversation_messages").insert({
      chatbot_id: body.chatbot_id,
      role: "assistant",
      content: answer,
      metadata: { session_id: body.session_id || null },
    });

    // Update chatbot statistics
    const currentStats = chatbot.statistics as any || {};
    await adminClient
      .from("chatbots")
      .update({
        statistics: {
          ...currentStats,
          total_messages: (currentStats.total_messages || 0) + 2,
          total_conversations: (currentStats.total_conversations || 0) + (body.session_id ? 0 : 1),
          last_activity: new Date().toISOString(),
        },
      })
      .eq("id", body.chatbot_id);

    return new Response(
      JSON.stringify({
        success: true,
        answer,
        chatbot_name: chatbot.name,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process chat message",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

