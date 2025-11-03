import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validação de Segurança
    const authorization = req.headers.get("Authorization");
    const n8nSecret = Deno.env.get("N8N_WEBHOOK_SECRET");

    if (!n8nSecret || authorization !== `Bearer ${n8nSecret}`) {
      return new Response(JSON.stringify({ error: "Não autorizado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Extração dos dados
    const { leadId, messageId, content, direction, timestamp } = await req.json();

    if (!leadId || !messageId || !content || !direction || !timestamp) {
      throw new Error("Dados incompletos recebidos do n8n.");
    }

    // 3. Inserção no Banco de Dados
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabaseAdmin.from("whatsapp_messages").insert({
      lead_id: leadId,
      message_id: messageId,
      content: content,
      direction: direction,
      timestamp: timestamp,
    });

    if (error) {
      // Trata o caso de a mensagem já existir para evitar falhas
      if (error.code === '23505') { // unique_violation
        console.warn(`Mensagem duplicada ignorada: ${messageId}`);
        return new Response(JSON.stringify({ message: "Mensagem duplicada ignorada." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw error;
    }

    return new Response(JSON.stringify({ message: "Mensagem recebida com sucesso!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Erro no webhook do n8n:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});