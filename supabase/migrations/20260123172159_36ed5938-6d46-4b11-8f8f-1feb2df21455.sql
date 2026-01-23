-- Add approval status to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approval metadata
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_approval_status ON public.agents(approval_status);

-- Update existing agents to approved status (they were already in the system)
UPDATE public.agents SET approval_status = 'approved' WHERE approval_status IS NULL OR approval_status = 'pending';

-- Create a table for pending registration notifications
CREATE TABLE IF NOT EXISTS public.pending_registrations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  agent_name TEXT NOT NULL,
  agent_cpf TEXT NOT NULL,
  unit_id UUID REFERENCES public.units(id),
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  viewed_by_admin BOOLEAN DEFAULT false,
  viewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pending_registrations_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for pending_registrations_log
CREATE POLICY "Admins and masters can view pending registrations"
ON public.pending_registrations_log
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'master')
);

CREATE POLICY "Admins and masters can update pending registrations"
ON public.pending_registrations_log
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'master')
);

CREATE POLICY "System can insert pending registrations"
ON public.pending_registrations_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for pending registrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_registrations_log;