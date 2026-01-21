-- ============================================
-- SISTEMA ADMINISTRATIVO COMPLETO
-- ============================================

-- 1. EXPANDIR ROLES (já existe app_role, vamos adicionar mais valores)
-- Primeiro, verificar e criar enum se não existir com novos valores
DO $$ 
BEGIN
  -- Add 'editor' to existing enum if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'editor' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'editor';
  END IF;
END $$;

-- 2. CRIAR TABELA DE TELAS DINÂMICAS
CREATE TABLE IF NOT EXISTS public.dynamic_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  screen_type VARCHAR(50) NOT NULL DEFAULT 'welcome', -- welcome, banner, modal, fullscreen
  title VARCHAR(200),
  subtitle TEXT,
  content JSONB DEFAULT '{}', -- cards, buttons, images, etc
  styles JSONB DEFAULT '{}', -- colors, fonts, spacing
  is_active BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 0,
  show_on_login BOOLEAN DEFAULT false,
  target_user_types TEXT[] DEFAULT ARRAY['all'], -- all, new, active, premium, trial, expired
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. CRIAR TABELA DE ANÚNCIOS/PROPAGANDAS
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  ad_type VARCHAR(50) NOT NULL DEFAULT 'banner', -- banner, popup, fullscreen, video, card
  content_type VARCHAR(50) NOT NULL DEFAULT 'image', -- image, video, html, interactive
  title VARCHAR(200),
  description TEXT,
  media_url TEXT,
  click_url TEXT,
  cta_text VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  min_view_seconds INTEGER DEFAULT 5, -- minimum time to view before close
  frequency_type VARCHAR(50) DEFAULT 'per_login', -- per_login, daily, weekly, once
  frequency_limit INTEGER DEFAULT 1, -- how many times per frequency period
  priority INTEGER NOT NULL DEFAULT 0,
  target_user_types TEXT[] DEFAULT ARRAY['all'],
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. CRIAR TABELA DE VISUALIZAÇÕES DE ANÚNCIOS (analytics)
CREATE TABLE IF NOT EXISTS public.ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false, -- viewed full duration
  clicked BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false, -- if they took the CTA action
  device_info JSONB DEFAULT '{}'
);

-- 5. CRIAR TABELA DE VISUALIZAÇÕES DE TELAS (analytics)
CREATE TABLE IF NOT EXISTS public.screen_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES public.dynamic_screens(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  interactions JSONB DEFAULT '{}' -- button clicks, etc
);

-- 6. CRIAR TABELA DE PERMISSÕES ADMINISTRATIVAS GRANULARES
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  can_manage_agents BOOLEAN DEFAULT false,
  can_manage_units BOOLEAN DEFAULT false,
  can_manage_licenses BOOLEAN DEFAULT false,
  can_manage_screens BOOLEAN DEFAULT false,
  can_manage_ads BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_manage_roles BOOLEAN DEFAULT false,
  can_delete_agents BOOLEAN DEFAULT false,
  can_manage_announcements BOOLEAN DEFAULT false,
  can_approve_transfers BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. INDEXES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_dynamic_screens_active ON public.dynamic_screens(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_dynamic_screens_login ON public.dynamic_screens(show_on_login, is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON public.advertisements(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_ad_views_agent ON public.ad_views(agent_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_views_ad ON public.ad_views(ad_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_screen_views_agent ON public.screen_views(agent_id, viewed_at DESC);

-- 8. TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE TRIGGER update_dynamic_screens_updated_at
  BEFORE UPDATE ON public.dynamic_screens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. FUNÇÃO PARA VERIFICAR PERMISSÕES DE ADMIN
CREATE OR REPLACE FUNCTION public.has_admin_permission(
  _user_id UUID,
  _permission TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    -- Master always has all permissions
    WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'master') THEN true
    -- Check specific permission
    WHEN _permission = 'manage_agents' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_manage_agents = true)
    WHEN _permission = 'manage_units' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_manage_units = true)
    WHEN _permission = 'manage_licenses' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_manage_licenses = true)
    WHEN _permission = 'manage_screens' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_manage_screens = true)
    WHEN _permission = 'manage_ads' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_manage_ads = true)
    WHEN _permission = 'view_analytics' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_view_analytics = true)
    WHEN _permission = 'manage_roles' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_manage_roles = true)
    WHEN _permission = 'delete_agents' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_delete_agents = true)
    WHEN _permission = 'manage_announcements' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_manage_announcements = true)
    WHEN _permission = 'approve_transfers' THEN 
      EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = _user_id AND can_approve_transfers = true)
    ELSE false
  END;
$$;

-- 10. RLS POLICIES

-- Dynamic Screens
ALTER TABLE public.dynamic_screens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage dynamic screens"
  ON public.dynamic_screens
  FOR ALL
  USING (is_admin_or_master(auth.uid()) OR has_admin_permission(auth.uid(), 'manage_screens'))
  WITH CHECK (is_admin_or_master(auth.uid()) OR has_admin_permission(auth.uid(), 'manage_screens'));

CREATE POLICY "Users can view active screens"
  ON public.dynamic_screens
  FOR SELECT
  USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= now()) 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Advertisements
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage advertisements"
  ON public.advertisements
  FOR ALL
  USING (is_admin_or_master(auth.uid()) OR has_admin_permission(auth.uid(), 'manage_ads'))
  WITH CHECK (is_admin_or_master(auth.uid()) OR has_admin_permission(auth.uid(), 'manage_ads'));

CREATE POLICY "Users can view active ads"
  ON public.advertisements
  FOR SELECT
  USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= now()) 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Ad Views
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own ad views"
  ON public.ad_views
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own ad history"
  ON public.ad_views
  FOR SELECT
  USING (agent_id = auth.uid() OR is_admin_or_master(auth.uid()));

CREATE POLICY "Admins can view all ad views"
  ON public.ad_views
  FOR SELECT
  USING (is_admin_or_master(auth.uid()) OR has_admin_permission(auth.uid(), 'view_analytics'));

-- Screen Views
ALTER TABLE public.screen_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own screen views"
  ON public.screen_views
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own screen history"
  ON public.screen_views
  FOR SELECT
  USING (agent_id = auth.uid() OR is_admin_or_master(auth.uid()));

CREATE POLICY "Admins can view all screen views"
  ON public.screen_views
  FOR SELECT
  USING (is_admin_or_master(auth.uid()) OR has_admin_permission(auth.uid(), 'view_analytics'));

-- Admin Permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only masters can manage admin permissions"
  ON public.admin_permissions
  FOR ALL
  USING (has_role(auth.uid(), 'master'))
  WITH CHECK (has_role(auth.uid(), 'master'));

CREATE POLICY "Admins can view own permissions"
  ON public.admin_permissions
  FOR SELECT
  USING (user_id = auth.uid());