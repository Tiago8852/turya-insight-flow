import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const N8N_WEBHOOK_URL = 'https://wgatech.app.n8n.cloud/webhook/e318c85e-0e6d-46a9-8205-9938e16895c2'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Recebendo requisição...')
    
    // Get form data
    const formData = await req.formData()
    
    console.log('Enviando para n8n:', N8N_WEBHOOK_URL)
    
    // Forward to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    })

    console.log('Resposta do n8n:', response.status)

    // Get response as blob to preserve binary data
    const blob = await response.blob()
    
    // Return with CORS headers
    return new Response(blob, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'text/html',
      }
    })
    
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
