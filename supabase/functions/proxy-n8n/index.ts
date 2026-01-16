import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const N8N_WEBHOOK_URL = "https://wgatech.app.n8n.cloud/webhook-test/deo-analise";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Recebendo requisição do frontend...");
    
    // Get the form data from the request
    const formData = await req.formData();
    
    console.log("Enviando para n8n webhook...");
    
    // Forward to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    console.log("Resposta do n8n:", response.status);

    if (!response.ok) {
      throw new Error(`n8n retornou status ${response.status}`);
    }

    // Get the HTML blob from n8n response
    const blob = await response.blob();
    console.log("Blob recebido:", blob.size, "bytes");

    // Return the blob with proper headers
    return new Response(blob, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
        "Content-Disposition": 'attachment; filename="Analise_DO.html"',
      },
    });
  } catch (error: unknown) {
    console.error("Erro no proxy:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
