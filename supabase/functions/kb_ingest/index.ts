import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngestPayload {
  project_id: string;
  items: Array<{
    source: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
}

// Simple text processing for knowledge base (you can replace this with your own logic)
function processTextForKB(text: string): string {
  // Basic text cleaning and processing
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 8000); // Limit length
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const body = (await req.json()) as IngestPayload;

    console.log(`Ingesting ${body.items.length} items for project ${body.project_id}`);

    let successCount = 0;
    let errorCount = 0;

    for (const item of body.items) {
      try {
        // Process text (you can add your own logic here)
        const processedContent = processTextForKB(item.content);

        // Insert into kb_chunks (without embedding for now)
        const { error: insertErr } = await adminClient
          .from("kb_chunks")
          .insert({
            project_id: body.project_id,
            source: item.source,
            content: processedContent,
            embedding: null, // No embedding needed for your custom chatbot
            metadata: item.metadata || {},
          });

        if (insertErr) {
          console.error("Insert error:", insertErr);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (itemError) {
        console.error("Item processing error:", itemError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ingested: successCount,
        failed: errorCount,
        total: body.items.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Ingest error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to ingest knowledge base",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

