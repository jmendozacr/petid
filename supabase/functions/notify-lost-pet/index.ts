import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BASE_URL = Deno.env.get('NEXT_PUBLIC_BASE_URL') ?? 'https://petid-three.vercel.app'
const DEDUP_MINUTES = 10

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const payload = await req.json()
  // Database Webhook sends { type, table, record, old_record }
  const record = payload.record ?? payload

  // Guard: only proceed if is_lost=true and we have coords
  if (!record.is_lost || record.lost_lat == null || record.lost_lng == null) {
    return Response.json({ skipped: 'no_coords_or_not_lost' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Dedup: skip if already notified for this pet in the last DEDUP_MINUTES
  const cutoff = new Date(Date.now() - DEDUP_MINUTES * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('lost_pet_notifications')
    .select('id')
    .eq('pet_id', record.id)
    .gt('sent_at', cutoff)
    .limit(1)

  if (recent && recent.length > 0) {
    return Response.json({ skipped: 'dedup' })
  }

  // Find opted-in users within 5km
  const { data: recipients, error: rpcError } = await supabase
    .rpc('find_nearby_opted_in_users', {
      p_lat: record.lost_lat,
      p_lng: record.lost_lng,
      p_owner_id: record.user_id,
    })

  if (rpcError) {
    console.error('RPC error:', rpcError)
    return Response.json({ error: rpcError.message }, { status: 500 })
  }

  if (!recipients || recipients.length === 0) {
    return Response.json({ sent: 0, reason: 'no_recipients' })
  }

  const petName = record.name ?? 'A pet'
  const petSpecies = record.species ?? 'pet'
  const publicUrl = `${BASE_URL}/p/${record.id}`

  let sent = 0
  for (const recipient of recipients) {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PetID Alerts <alerts@petid-three.vercel.app>',
        to: recipient.email,
        subject: `🐾 Lost ${petSpecies} near you — ${petName}`,
        html: buildEmailHtml({ petName, petSpecies, publicUrl, recipientEmail: recipient.email }),
      }),
    })

    if (emailRes.ok) {
      await supabase.from('lost_pet_notifications').insert({
        pet_id: record.id,
        notified_user_id: recipient.profile_id,
        channel: 'email',
      })
      sent++
    } else {
      console.error('Resend error:', await emailRes.text())
    }
  }

  return Response.json({ sent })
})

function buildEmailHtml({ petName, petSpecies, publicUrl, recipientEmail }: {
  petName: string
  petSpecies: string
  publicUrl: string
  recipientEmail: string
}): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h1 style="font-size:24px;margin-bottom:8px">🐾 Lost ${petSpecies} near you</h1>
  <p style="font-size:16px;color:#444">
    <strong>${petName}</strong> was reported lost close to your area.
    If you see this ${petSpecies}, please contact the owner using the link below.
  </p>
  <a href="${publicUrl}"
     style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
    View ${petName}'s profile
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
  <p style="font-size:12px;color:#888">
    You received this because you opted in to nearby lost pet alerts.<br/>
    <a href="https://petid-three.vercel.app/dashboard/settings" style="color:#7c3aed">Manage notification settings</a>
  </p>
</body>
</html>`
}
