import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função para limpar e padronizar o número de telefone
const cleanPhoneNumber = (phone: string) => {
  return phone.replace(/\D/g, '');
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

    // 2. Extração dos dados do n8n (payload atualizado)
    const { contactName, contactPhone, messageId, content, direction, timestamp } = await req.json();

    if (!contactName || !contactPhone || !messageId || !content || !direction || !timestamp) {
      throw new Error("Dados incompletos. O payload deve conter: contactName, contactPhone, messageId, content, direction, timestamp.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cleanedPhone = cleanPhoneNumber(contactPhone);
    let leadId;

    // 3. Procura por um lead existente com o mesmo número de telefone
    const { data: existingLead, error: findError } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("telefone", cleanedPhone)
      .maybeSingle();

    if (findError) throw findError;

    if (existingLead) {
      // Se o lead existe, usa o ID dele
      leadId = existingLead.id;
    } else {
      // 4. Se não encontrar, cria um novo lead
      
      // Encontra um admin para ser o responsável padrão
      const { data: adminUser, error: adminError } = await supabaseAdmin
        .from("app_users")
        .select("id")
        .eq("papel", "admin")
        .limit(1)
        .single();

      if (adminError || !adminUser) {
        throw new Error("Nenhum usuário administrador encontrado para atribuir o novo lead.");
      }
      
      const { data: newLead, error: createError } = await supabaseAdmin
        .from("leads")
        .insert({
          nome: contactName,
          telefone: cleanedPhone,
          origem: "whatsapp",
          status: "novo",
          valor: 0,
          responsavel_id: adminUser.id,
          created_by: adminUser.id,
        })
        .select("id")
        .single();

      if (createError) throw createError;
      
      leadId = newLead.id;
    }

    // 5. Insere a mensagem do WhatsApp, vinculando ao lead (existente ou novo)
    const { error: messageError } = await supabaseAdmin.from("whatsapp_messages").insert({
      lead_id: leadId,
      message_id: messageId,
      content: content,
      direction: direction,
      timestamp: timestamp,
    });

    if (messageError) {
      if (messageError.code === '23505') { // unique_violation
        console.warn(`Mensagem duplicada ignorada: ${messageId}`);
        return new Response(JSON.stringify({ message: "Mensagem duplicada ignorada." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw messageError;
    }

    return new Response(JSON.stringify({ message: "Operação concluída com sucesso!", leadId: leadId }), {
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