// Supabase Edge Function (Deno). Deploy with: supabase functions deploy admin-list-users
// Requires the ADMIN_EMAIL secret: supabase secrets set ADMIN_EMAIL=<your admin account's email>
//
// Lists all signed-up accounts. auth.users isn't reachable from the browser
// at all (admin or not) -- this uses the service-role key server-side after
// independently verifying the caller is the admin.
import { corsHeaders, requireAdmin, serviceRoleClient } from '../_shared/admin.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const check = await requireAdmin(req)
  if (!check.ok) {
    return new Response(JSON.stringify({ error: check.message }), {
      status: check.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { data, error } = await serviceRoleClient().auth.admin.listUsers({ perPage: 1000 })
    if (error) throw error

    const users = data.users.map((u) => ({ id: u.id, email: u.email, createdAt: u.created_at }))

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
