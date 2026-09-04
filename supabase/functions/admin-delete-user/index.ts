// Supabase Edge Function (Deno). Deploy with: supabase functions deploy admin-delete-user
// Requires the ADMIN_EMAIL secret: supabase secrets set ADMIN_EMAIL=<your admin account's email>
//
// Deletes a user via the Admin API (service-role key, server-side only).
// Cascading FKs on workout_sessions/day_insights/profiles clean up their data.
import { corsHeaders, requireAdmin, serviceRoleClient } from '../_shared/admin.ts'

interface RequestBody {
  userId: string
}

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
    const { userId }: RequestBody = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (userId === check.userId) {
      return new Response(JSON.stringify({ error: "Can't delete your own admin account" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error } = await serviceRoleClient().auth.admin.deleteUser(userId)
    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
