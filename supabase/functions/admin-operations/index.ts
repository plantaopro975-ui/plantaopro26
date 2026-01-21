import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-master-token",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface AuthResult {
  ok: boolean;
  status?: number;
  error?: string;
  userId?: string;
  isMaster?: boolean;
}

async function authenticateRequest(admin: any, req: Request): Promise<AuthResult> {
  const masterToken = req.headers.get("x-master-token") || "";
  const authHeader = req.headers.get("authorization") || "";

  // Try master token first
  if (masterToken) {
    const { data, error } = await admin
      .from("master_session_tokens")
      .select("id, expires_at")
      .eq("token", masterToken)
      .maybeSingle();

    if (error) {
      console.error("master token lookup error", error);
      return { ok: false, status: 500, error: "Falha ao validar sessão master." };
    }

    if (!data) {
      return { ok: false, status: 401, error: "Sessão master inválida." };
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      return { ok: false, status: 401, error: "Sessão master expirada." };
    }

    return { ok: true, isMaster: true };
  }

  // Try JWT token for admin users
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error } = await admin.auth.getUser(token);
    
    if (error || !user) {
      return { ok: false, status: 401, error: "Token de sessão inválido." };
    }

    // Check if user has admin or master role
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!roleData || (roleData.role !== "admin" && roleData.role !== "master")) {
      return { ok: false, status: 403, error: "Acesso negado. Privilégios insuficientes." };
    }

    return { ok: true, userId: user.id, isMaster: roleData.role === "master" };
  }

  return { ok: false, status: 401, error: "Autenticação necessária." };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Método não suportado" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const auth = await authenticateRequest(admin, req);
    if (!auth.ok) {
      return json({ success: false, error: auth.error }, auth.status);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    if (!action) return json({ success: false, error: "Ação obrigatória." }, 400);

    // ===== ROLE OPERATIONS =====
    if (action === "set_role") {
      const userId = String(body?.userId ?? "");
      const role = String(body?.role ?? "user");
      if (!userId) return json({ success: false, error: "userId obrigatório." }, 400);

      const { data: existing } = await admin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await admin.from("user_roles").update({ role }).eq("user_id", userId);
        if (error) return json({ success: false, error: error.message }, 400);
      } else {
        const { error } = await admin.from("user_roles").insert({ user_id: userId, role });
        if (error) return json({ success: false, error: error.message }, 400);
      }

      return json({ success: true, data: {} });
    }

    // ===== UNIT OPERATIONS =====
    if (action === "update_unit") {
      const unitId = String(body?.unitId ?? "");
      const patch = body?.patch ?? null;
      if (!unitId || !patch || typeof patch !== "object") {
        return json({ success: false, error: "unitId e patch são obrigatórios." }, 400);
      }

      const { error } = await admin.from("units").update(patch).eq("id", unitId);
      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, data: {} });
    }

    if (action === "create_unit") {
      const data = body?.data ?? null;
      if (!data || typeof data !== "object") {
        return json({ success: false, error: "data obrigatório." }, 400);
      }
      const { data: inserted, error } = await admin.from("units").insert(data).select("id").maybeSingle();
      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, data: { unitId: inserted?.id } });
    }

    // ===== AGENT OPERATIONS =====
    if (action === "create_agent") {
      const name = String(body?.name ?? "").trim();
      const cpf = String(body?.cpf ?? "").replace(/\D/g, "");
      const password = String(body?.password ?? "");
      const unit_id = String(body?.unit_id ?? "");
      const team = String(body?.team ?? "");
      const matricula = body?.matricula ? String(body.matricula) : null;
      const phone = body?.phone ? String(body.phone) : null;

      if (!name || !cpf || !password || !unit_id || !team) {
        return json({ success: false, error: "Campos obrigatórios ausentes." }, 400);
      }

      const email = `${cpf}@agent.plantaopro.com`;

      // Check if CPF already exists
      const { data: existingAgent } = await admin
        .from("agents")
        .select("id")
        .eq("cpf", cpf)
        .maybeSingle();

      if (existingAgent) {
        return json({ success: false, error: "CPF já cadastrado." }, 400);
      }

      // Create auth user (admin API)
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name.toUpperCase() },
      });

      if (createErr) return json({ success: false, error: createErr.message }, 400);

      const userId = created.user?.id;
      if (!userId) return json({ success: false, error: "Falha ao criar usuário." }, 500);

      // Create agent record
      const licenseExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { error: agentErr } = await admin.from("agents").insert({
        id: userId,
        name: name.toUpperCase(),
        cpf,
        matricula,
        phone,
        team,
        unit_id,
        is_active: true,
        license_status: "active",
        license_expires_at: licenseExpiry,
      });

      if (agentErr) {
        // Rollback auth user if agent insert fails
        await admin.auth.admin.deleteUser(userId);
        return json({ success: false, error: agentErr.message }, 400);
      }

      // Default role (best-effort)
      try {
        await admin.from("user_roles").insert({ user_id: userId, role: "user" });
      } catch {
        // ignore
      }

      return json({ success: true, data: { agentId: userId } });
    }

    if (action === "update_agent") {
      const agentId = String(body?.agentId ?? "");
      const patch = body?.patch ?? null;
      if (!agentId || !patch || typeof patch !== "object") {
        return json({ success: false, error: "agentId e patch são obrigatórios." }, 400);
      }

      const { error } = await admin.from("agents").update(patch).eq("id", agentId);
      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, data: {} });
    }

    if (action === "delete_agent") {
      const agentId = String(body?.agentId ?? "");
      if (!agentId) return json({ success: false, error: "agentId obrigatório." }, 400);

      // Delete from related tables first
      const tables = [
        "shift_alerts", "overtime_bank", "agent_shifts", "agent_events",
        "agent_leaves", "shift_planner_configs", "shifts", "transfer_requests",
        "chat_room_members", "deleted_messages", "access_logs", "payments",
        "notifications", "saved_credentials", "password_change_requests",
        "offline_license_cache", "license_code_usage", "chat_messages",
      ];

      for (const table of tables) {
        const column = table === "chat_messages" ? "sender_id" : "agent_id";
        try {
          await admin.from(table).delete().eq(column, agentId);
        } catch {
          // ignore
        }
      }

      // Delete user_roles and profiles
      try {
        await admin.from("user_roles").delete().eq("user_id", agentId);
      } catch {
        // ignore
      }
      try {
        await admin.from("profiles").delete().eq("user_id", agentId);
      } catch {
        // ignore
      }

      // Delete agent record
      const { error: agentDelErr } = await admin.from("agents").delete().eq("id", agentId);
      if (agentDelErr) return json({ success: false, error: agentDelErr.message }, 400);

      // Delete auth user
      await admin.auth.admin.deleteUser(agentId).catch(() => {});

      return json({ success: true, data: {} });
    }

    if (action === "toggle_agent_status") {
      const agentId = String(body?.agentId ?? "");
      const isActive = Boolean(body?.isActive);
      if (!agentId) return json({ success: false, error: "agentId obrigatório." }, 400);

      const { error } = await admin.from("agents").update({ is_active: isActive }).eq("id", agentId);
      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, data: {} });
    }

    if (action === "freeze_agent") {
      const agentId = String(body?.agentId ?? "");
      const freeze = Boolean(body?.freeze);
      if (!agentId) return json({ success: false, error: "agentId obrigatório." }, 400);

      const updateData: Record<string, unknown> = {
        is_frozen: freeze,
        license_status: freeze ? "frozen" : "active",
        frozen_at: freeze ? new Date().toISOString() : null,
        frozen_by: freeze ? (auth.userId || null) : null,
      };

      if (!freeze) {
        updateData.unblocked_by = auth.userId || null;
        updateData.unblocked_at = new Date().toISOString();
      }

      const { error } = await admin.from("agents").update(updateData).eq("id", agentId);
      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, data: {} });
    }

    if (action === "extend_license") {
      const agentId = String(body?.agentId ?? "");
      const months = Number(body?.months) || 1;
      if (!agentId) return json({ success: false, error: "agentId obrigatório." }, 400);

      const { data: agent } = await admin
        .from("agents")
        .select("license_expires_at")
        .eq("id", agentId)
        .maybeSingle();

      const currentExpiry = agent?.license_expires_at ? new Date(agent.license_expires_at) : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(baseDate.getTime() + months * 30 * 24 * 60 * 60 * 1000);

      const { error } = await admin.from("agents").update({
        license_expires_at: newExpiry.toISOString().split("T")[0],
        license_status: "active",
        is_frozen: false,
      }).eq("id", agentId);

      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, data: { newExpiresAt: newExpiry.toISOString() } });
    }

    if (action === "reset_password") {
      const agentId = String(body?.agentId ?? "");
      const newPassword = String(body?.newPassword ?? "");
      if (!agentId || !newPassword) {
        return json({ success: false, error: "agentId e newPassword são obrigatórios." }, 400);
      }

      const { error } = await admin.auth.admin.updateUserById(agentId, {
        password: newPassword,
      });

      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true, data: {} });
    }

    return json({ success: false, error: "Ação desconhecida." }, 400);
  } catch (err) {
    console.error("admin-operations error", err);
    return json({ success: false, error: "Erro interno." }, 500);
  }
});
