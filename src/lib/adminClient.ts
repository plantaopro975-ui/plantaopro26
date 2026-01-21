import { supabase } from '@/integrations/supabase/client';
import { getMasterToken } from '@/lib/masterSession';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export class AdminClientError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AdminClientError';
    this.status = status;
  }
}

type AdminAction =
  | 'create_agent'
  | 'delete_agent'
  | 'update_agent'
  | 'set_role'
  | 'update_unit'
  | 'create_unit'
  | 'toggle_agent_status'
  | 'extend_license'
  | 'freeze_agent'
  | 'reset_password';

/**
 * Unified admin client that works for both Master (token-based) and Admin (session-based)
 */
async function callAdminBackend<T>(action: AdminAction, payload: Record<string, unknown>): Promise<T> {
  const masterToken = getMasterToken();
  
  // Get current session for admin users
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  
  if (masterToken) {
    headers['x-master-token'] = masterToken;
  } else if (session?.access_token) {
    headers['authorization'] = `Bearer ${session.access_token}`;
  } else {
    throw new AdminClientError('Sessão expirada. Faça login novamente.', 401);
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-operations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...payload }),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    throw new AdminClientError(json?.error || `Falha na operação (${res.status}).`, res.status);
  }

  if (!json?.success) {
    throw new AdminClientError(json?.error || 'Operação não concluída.');
  }

  return json.data as T;
}

export const adminClient = {
  // Agent operations
  createAgent: (input: {
    name: string;
    cpf: string;
    password: string;
    unit_id: string;
    team: string;
    matricula?: string | null;
    phone?: string | null;
  }) => callAdminBackend<{ agentId: string }>('create_agent', input),

  updateAgent: (input: {
    agentId: string;
    patch: Record<string, unknown>;
  }) => callAdminBackend<{}>('update_agent', input),

  deleteAgent: (input: { agentId: string }) => 
    callAdminBackend<{}>('delete_agent', input),

  toggleAgentStatus: (input: { agentId: string; isActive: boolean }) =>
    callAdminBackend<{}>('toggle_agent_status', input),

  freezeAgent: (input: { agentId: string; freeze: boolean }) =>
    callAdminBackend<{}>('freeze_agent', input),

  extendLicense: (input: { agentId: string; months: number }) =>
    callAdminBackend<{ newExpiresAt: string }>('extend_license', input),

  resetPassword: (input: { agentId: string; newPassword: string }) =>
    callAdminBackend<{}>('reset_password', input),

  // Role operations
  setRole: (input: { userId: string; role: 'admin' | 'user' | 'master' }) =>
    callAdminBackend<{}>('set_role', input),

  // Unit operations
  createUnit: (input: { data: Record<string, unknown> }) => 
    callAdminBackend<{ unitId: string }>('create_unit', input),

  updateUnit: (input: { unitId: string; patch: Record<string, unknown> }) =>
    callAdminBackend<{}>('update_unit', input),
};

/**
 * Check if current user has admin privileges (either master token or admin role)
 */
export async function hasAdminAccess(): Promise<boolean> {
  const masterToken = getMasterToken();
  if (masterToken) return true;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return false;
  
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle();
  
  return data?.role === 'admin' || data?.role === 'master';
}
