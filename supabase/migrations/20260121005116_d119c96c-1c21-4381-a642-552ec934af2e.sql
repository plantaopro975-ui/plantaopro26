-- Create admin announcements table
CREATE TABLE public.admin_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'unit', 'team')),
  target_unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  target_team TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view active announcements"
ON public.admin_announcements
FOR SELECT
USING (
  is_active = true 
  AND starts_at <= now() 
  AND (expires_at IS NULL OR expires_at > now())
);

CREATE POLICY "Admins can manage announcements"
ON public.admin_announcements
FOR ALL
USING (is_admin_or_master(auth.uid()))
WITH CHECK (is_admin_or_master(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_admin_announcements_updated_at
BEFORE UPDATE ON public.admin_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_admin_announcements_active ON public.admin_announcements(is_active, starts_at, expires_at);
CREATE INDEX idx_admin_announcements_target ON public.admin_announcements(target_type, target_unit_id, target_team);