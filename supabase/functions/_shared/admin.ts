// Shared by the admin-* Edge Functions (folders prefixed with _ aren't
// deployed as their own function by the Supabase CLI).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminCheckResult {
  ok: true
  userId: string
}

interface AdminCheckFailure {
  ok: false
  status: number
  message: string
}

/**
 * Verifies the caller's JWT belongs to the configured admin. This is the real
 * security boundary — independent of anything the client claims about itself,
 * since it re-derives the caller's identity server-side from the forwarded
 * Authorization header rather than trusting a client-supplied value.
 */
export async function requireAdmin(req: Request): Promise<AdminCheckResult | AdminCheckFailure> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return { ok: false, status: 401, message: 'Missing Authorization header' }

  const anonClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data, error } = await anonClient.auth.getUser()
  if (error || !data.user) return { ok: false, status: 401, message: 'Not authenticated' }

  const adminEmail = Deno.env.get('ADMIN_EMAIL')
  if (!adminEmail || data.user.email !== adminEmail) {
    return { ok: false, status: 403, message: 'Forbidden' }
  }

  return { ok: true, userId: data.user.id }
}

/** Service-role client: bypasses RLS entirely, needed for the Admin API (list/delete users). */
export function serviceRoleClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}
