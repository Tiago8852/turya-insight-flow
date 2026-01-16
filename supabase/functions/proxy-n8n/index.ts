import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// URL do webhook n8n - modo produção
const N8N_WEBHOOK_URL = "https://wgatech.app.n8n.cloud/webhook/deo-analise";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // ===== AÇÃO 1: Disparar o workflow (fire-and-forget) =====
    if (req.method === "POST" && action === "trigger") {
      console.log("Recebendo arquivos do frontend...");
      
      const formData = await req.formData();
      const sessionId = formData.get("session_id") as string;
      
      console.log("Session ID:", sessionId);
      console.log("Disparando workflow n8n (fire-and-forget)...");
      
      // Adiciona a URL de callback para o n8n salvar o resultado
      const callbackUrl = `${supabaseUrl}/functions/v1/proxy-n8n?action=callback&sessionId=${sessionId}`;
      formData.append("callback_url", callbackUrl);
      
      // Dispara o webhook sem esperar resposta completa
      fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      }).then(response => {
        console.log("n8n respondeu com status:", response.status);
      }).catch(err => {
        console.error("Erro ao chamar n8n:", err.message);
      });

      // Retorna imediatamente - o frontend vai fazer polling
      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionId,
          message: "Análise iniciada. Aguarde o processamento."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== AÇÃO 2: Callback do n8n (recebe o HTML e salva no Storage) =====
    if (req.method === "POST" && action === "callback") {
      const sessionId = url.searchParams.get("sessionId");
      console.log("Callback recebido do n8n para session:", sessionId);

      if (!sessionId) {
        return new Response(
          JSON.stringify({ error: "sessionId não fornecido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Recebe o conteúdo HTML
      const contentType = req.headers.get("content-type") || "";
      let htmlContent: string;

      if (contentType.includes("text/html")) {
        htmlContent = await req.text();
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (file) {
          htmlContent = await file.text();
        } else {
          throw new Error("Arquivo não encontrado no FormData");
        }
      } else {
        // Tenta como blob/binário
        const blob = await req.blob();
        htmlContent = await blob.text();
      }

      console.log("HTML recebido, tamanho:", htmlContent.length);

      // Salva no Storage
      const fileName = `${sessionId}/Analise_DO.html`;
      const { error: uploadError } = await supabase.storage
        .from("analysis-results")
        .upload(fileName, htmlContent, {
          contentType: "text/html",
          upsert: true,
        });

      if (uploadError) {
        console.error("Erro ao salvar no Storage:", uploadError);
        throw uploadError;
      }

      console.log("HTML salvo no Storage:", fileName);

      return new Response(
        JSON.stringify({ success: true, fileName }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== AÇÃO 3: Verificar se resultado está pronto =====
    if (req.method === "GET" && action === "check") {
      const sessionId = url.searchParams.get("sessionId");
      
      if (!sessionId) {
        return new Response(
          JSON.stringify({ error: "sessionId não fornecido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fileName = `${sessionId}/Analise_DO.html`;
      
      // Tenta buscar o arquivo
      const { data, error } = await supabase.storage
        .from("analysis-results")
        .download(fileName);

      if (error) {
        // Arquivo ainda não existe - ainda processando
        return new Response(
          JSON.stringify({ status: "processing" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Arquivo existe - retorna o HTML
      console.log("Resultado encontrado, retornando HTML");
      
      return new Response(data, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
          "Content-Disposition": 'attachment; filename="Analise_DO.html"',
        },
      });
    }

    return new Response(
      JSON.stringify({ error: "Ação não reconhecida. Use: trigger, callback ou check" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Erro:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
