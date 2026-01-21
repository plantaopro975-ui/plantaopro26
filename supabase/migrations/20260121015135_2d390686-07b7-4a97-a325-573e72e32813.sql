-- Create table for syncing saved credentials across devices
CREATE TABLE public.saved_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL,
  name TEXT,
  -- Encrypted password token (AES encrypted, only decryptable client-side)
  encrypted_token TEXT,
  device_id TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, device_id)
);

-- Enable RLS
ALTER TABLE public.saved_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own saved credentials
CREATE POLICY "Users can view own saved credentials"
ON public.saved_credentials FOR SELECT
USING (agent_id = current_agent_id() OR is_admin_or_master(auth.uid()));

CREATE POLICY "Users can insert own saved credentials"
ON public.saved_credentials FOR INSERT
WITH CHECK (agent_id = current_agent_id() OR is_admin_or_master(auth.uid()));

CREATE POLICY "Users can update own saved credentials"
ON public.saved_credentials FOR UPDATE
USING (agent_id = current_agent_id() OR is_admin_or_master(auth.uid()));

CREATE POLICY "Users can delete own saved credentials"
ON public.saved_credentials FOR DELETE
USING (agent_id = current_agent_id() OR is_admin_or_master(auth.uid()));

-- Index for fast lookups
CREATE INDEX idx_saved_credentials_agent ON public.saved_credentials(agent_id);
CREATE INDEX idx_saved_credentials_cpf ON public.saved_credentials(cpf);

-- Trigger for updated_at
CREATE TRIGGER update_saved_credentials_updated_at
BEFORE UPDATE ON public.saved_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();