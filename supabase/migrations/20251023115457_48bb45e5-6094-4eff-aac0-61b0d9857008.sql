-- =========================================================
-- CRM NoCode – Supabase DDL + RLS (ids int8)
-- =========================================================

-- Tipos ENUM
CREATE TYPE user_role AS ENUM ('admin', 'vendedor', 'nenhum');
CREATE TYPE lead_status AS ENUM ('Novo', 'Atendimento', 'Ganho', 'Perdido');
CREATE TYPE lead_origin AS ENUM ('Formulário', 'WhatsApp', 'Redes Sociais', 'Indicação', 'Outros');

-- Tabela de perfis de usuário da aplicação
CREATE TABLE IF NOT EXISTS public.app_users (
  id BIGSERIAL PRIMARY KEY,
  auth_uid UUID UNIQUE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  papel user_role NOT NULL DEFAULT 'nenhum',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.app_users IS 'Perfis vinculados ao Supabase Auth por auth_uid. Papel padrão "nenhum".';

-- Tabela de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  empresa TEXT,
  email TEXT,
  telefone TEXT,
  origem lead_origin NOT NULL,
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  responsavel_id INT8 NOT NULL REFERENCES public.app_users(id) ON DELETE RESTRICT,
  status lead_status NOT NULL DEFAULT 'Novo',
  observacoes TEXT
);

CREATE INDEX IF NOT EXISTS leads_responsavel_idx ON public.leads (responsavel_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_criado_em_idx ON public.leads (criado_em);

-- Funções utilitárias para RLS
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS BIGINT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id
  FROM public.app_users u
  WHERE u.auth_uid = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.papel
  FROM public.app_users u
  WHERE u.auth_uid = auth.uid()
  LIMIT 1
$$;

-- RPC para inicializar/garantir o perfil do usuário autenticado
CREATE OR REPLACE FUNCTION public.init_current_user(p_nome TEXT, p_email TEXT)
RETURNS public.app_users
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid UUID := auth.uid();
  v_user public.app_users;
BEGIN
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  INSERT INTO public.app_users (auth_uid, nome, email, papel)
  VALUES (v_auth_uid, COALESCE(p_nome, 'Novo Usuário'), p_email, 'nenhum')
  ON CONFLICT (auth_uid) DO UPDATE
    SET nome = EXCLUDED.nome,
        email = COALESCE(EXCLUDED.email, public.app_users.email)
  RETURNING * INTO v_user;

  RETURN v_user;
END;
$$;

-- Opcional: RPC para obter id e papel juntos numa chamada
CREATE OR REPLACE FUNCTION public.current_identity()
RETURNS TABLE (user_id BIGINT, role user_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.papel FROM public.app_users u WHERE u.auth_uid = auth.uid() LIMIT 1
$$;

-- Ativar RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies em app_users
CREATE POLICY app_users_select_admin
  ON public.app_users
  FOR SELECT
  USING (public.current_user_role() = 'admin');

CREATE POLICY app_users_select_self
  ON public.app_users
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = auth_uid);

CREATE POLICY app_users_insert_admin
  ON public.app_users
  FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY app_users_update_admin
  ON public.app_users
  FOR UPDATE
  USING (public.current_user_role() = 'admin')
  WITH CHECK (TRUE);

CREATE POLICY app_users_update_self
  ON public.app_users
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = auth_uid)
  WITH CHECK (
    auth.uid() = auth_uid
    AND (SELECT public.current_user_role()) <> 'nenhum'
    AND (
      COALESCE(papel, 'nenhum') = (SELECT papel FROM public.app_users WHERE auth_uid = auth.uid())
    )
  );

CREATE POLICY app_users_delete_admin
  ON public.app_users
  FOR DELETE
  USING (public.current_user_role() = 'admin');

-- Policies em leads
CREATE POLICY leads_select_roles
  ON public.leads
  FOR SELECT
  USING (public.current_user_role() IN ('admin','vendedor'));

CREATE POLICY leads_insert_admin
  ON public.leads
  FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY leads_insert_vendedor
  ON public.leads
  FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'vendedor'
    AND responsavel_id = public.current_user_id()
  );

CREATE POLICY leads_update_admin
  ON public.leads
  FOR UPDATE
  USING (public.current_user_role() = 'admin')
  WITH CHECK (TRUE);

CREATE POLICY leads_update_vendedor
  ON public.leads
  FOR UPDATE
  USING (
    public.current_user_role() = 'vendedor'
    AND responsavel_id = public.current_user_id()
  )
  WITH CHECK (
    responsavel_id = public.current_user_id()
  );

CREATE POLICY leads_delete_admin
  ON public.leads
  FOR DELETE
  USING (public.current_user_role() = 'admin');

-- Views simples para o Dashboard
CREATE OR REPLACE VIEW public.vw_dashboard_por_dia AS
SELECT
  DATE_TRUNC('day', l.criado_em)::DATE AS dia,
  COUNT(*) AS leads_criados,
  SUM(l.valor) FILTER (WHERE l.status = 'Ganho') AS valor_ganho
FROM public.leads l
GROUP BY 1
ORDER BY 1;

CREATE OR REPLACE VIEW public.vw_dashboard_por_origem AS
SELECT
  l.origem,
  COUNT(*) AS total_leads,
  SUM(l.valor) FILTER (WHERE l.status = 'Ganho') AS valor_ganho
FROM public.leads l
GROUP BY 1
ORDER BY 1;