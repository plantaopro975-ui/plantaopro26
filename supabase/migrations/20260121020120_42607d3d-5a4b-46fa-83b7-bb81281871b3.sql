-- Add missing fields to units table for coordinators
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS president_name TEXT,
ADD COLUMN IF NOT EXISTS security_coordinator_name TEXT;

-- Create activity_logs table for tracking system actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_name TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (is_admin_or_master(auth.uid()));

-- System can create logs (authenticated users)
CREATE POLICY "Authenticated users can create logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can delete old logs
CREATE POLICY "Admins can delete activity logs"
ON public.activity_logs FOR DELETE
USING (is_admin_or_master(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_agent ON public.activity_logs(agent_id);
CREATE INDEX idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);