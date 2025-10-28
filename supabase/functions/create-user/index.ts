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
    const { email, password, nome, papel } = await req.json();

    if (!email || !password || !nome || !papel) {
      throw new Error("Campos obrigatórios ausentes: email, password, nome, papel");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Cria o usuário no sistema de autenticação do Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: { nome },
    });

    if (authError) {
      throw authError;
    }

    // O gatilho do banco de dados já criou o perfil do usuário com o papel 'nenhum'.
    // Agora, atualizamos para o papel que o administrador especificou.
    const newUserId = authData.user.id;

    // Corrigido: a coluna para o ID do usuário é 'id', não 'auth_uid'.
    const { error: roleError } = await supabaseAdmin
      .from("app_users")
      .update({ papel })
      .eq("id", newUserId);

    if (roleError) {
      // Se a atualização do papel falhar, desfaz a criação do usuário para evitar inconsistências.
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw roleError;
    }

    return new Response(JSON.stringify({ message: "Usuário criado com sucesso" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});