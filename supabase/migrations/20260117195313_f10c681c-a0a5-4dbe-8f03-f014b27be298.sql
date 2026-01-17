-- Create password change requests table
CREATE TABLE public.password_change_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    admin_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_change_requests ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view their own requests
CREATE POLICY "Agents can view their own password requests"
ON public.password_change_requests
FOR SELECT
USING (agent_id IN (SELECT id FROM public.agents WHERE cpf IS NOT NULL));

-- Policy for agents to create requests
CREATE POLICY "Agents can create password requests"
ON public.password_change_requests
FOR INSERT
WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE cpf IS NOT NULL));

-- Policy for admins to manage all requests
CREATE POLICY "Admins can manage all password requests"
ON public.password_change_requests
FOR ALL
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.password_change_requests;

-- Create trigger for updated_at
CREATE TRIGGER update_password_change_requests_updated_at
BEFORE UPDATE ON public.password_change_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();