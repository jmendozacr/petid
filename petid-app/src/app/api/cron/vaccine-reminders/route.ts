import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const NOTIFY_DAYS = 7

type DueVaccine = {
  id: string
  description: string
  next_due_date: string
  pet: { id: string; name: string; user_id: string } | null
}

export async function GET(request: Request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const today = new Date().toISOString().split('T')[0]
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() + NOTIFY_DAYS)
  const cutoff = cutoffDate.toISOString().split('T')[0]

  const { data: dueVaccines, error } = await supabase
    .from('health_records')
    .select('id, description, next_due_date, pet:pets(id, name, user_id)')
    .eq('type', 'vaccine')
    .gte('next_due_date', today)
    .lte('next_due_date', cutoff)
    .is('reminder_sent_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const record of (dueVaccines ?? []) as unknown as DueVaccine[]) {
    const pet = record.pet
    if (!pet?.user_id) { skipped++; continue }

    const { data: userData } = await supabase.auth.admin.getUserById(pet.user_id)
    const email = userData?.user?.email
    if (!email) { skipped++; continue }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PetID Reminders <reminders@petid-three.vercel.app>',
        to: email,
        subject: `Vaccine reminder for ${pet.name}`,
        html: buildReminderHtml({
          petName: pet.name,
          description: record.description,
          nextDueDate: record.next_due_date,
        }),
      }),
    })

    if (emailRes.ok) {
      await supabase
        .from('health_records')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', record.id)
      sent++
    } else {
      skipped++
    }
  }

  return NextResponse.json({ sent, skipped })
}

function buildReminderHtml({
  petName,
  description,
  nextDueDate,
}: {
  petName: string
  description: string
  nextDueDate: string
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://petid-three.vercel.app'
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h1 style="font-size:24px;margin-bottom:8px">💉 Vaccine reminder for ${petName}</h1>
  <p style="font-size:16px;color:#444">
    <strong>${description}</strong> is due on <strong>${nextDueDate}</strong>.
    Time to book a vet appointment!
  </p>
  <a href="${baseUrl}/dashboard"
     style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
    View ${petName}'s health records
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
  <p style="font-size:12px;color:#888">
    This reminder was sent by PetID.<br/>
    <a href="${baseUrl}/dashboard/settings" style="color:#7c3aed">Manage your pets</a>
  </p>
</body>
</html>`
}
