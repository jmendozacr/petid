'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Pet, FoundReport, ToggleLostPetResult } from '@/types/pet'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://petid-three.vercel.app'

export async function toggleLostPetStatus(
  petId: string,
  isLost: boolean,
  coords?: { lat: number; lng: number } | null
): Promise<ToggleLostPetResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: pet } = await supabase
    .from('pets')
    .select('user_id, name')
    .eq('id', petId)
    .single()

  if (!pet) {
    return { success: false, error: 'Pet not found' }
  }

  if (pet.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Invariant: lost_since/lost_lat/lost_lng must be null when is_lost is false
    const update = isLost
      ? {
          is_lost: true,
          lost_since: new Date().toISOString(),
          lost_lat: coords?.lat ?? null,
          lost_lng: coords?.lng ?? null,
        }
      : { is_lost: false, lost_since: null, lost_lat: null, lost_lng: null }

    const { data: updated, error } = await supabase
      .from('pets')
      .update(update)
      .eq('id', petId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath(`/p/${petId}`)
    revalidatePath(`/dashboard/pets/${petId}`)

    let foundReport: FoundReport | undefined

    if (!isLost) {
      const { data: report } = await supabase
        .from('found_reports')
        .select('contact, message')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (report) {
        foundReport = { contact: report.contact, message: report.message }

        if (report.contact.includes('@') && process.env.RESEND_API_KEY) {
          void fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'PetID Alerts <alerts@petid-three.vercel.app>',
              to: report.contact,
              subject: `${pet.name} has been found! Thank you for your report 🐾`,
              html: buildRecoveryEmailHtml({ petName: pet.name, baseUrl: BASE_URL }),
            }),
          })
        }
      }
    }

    return { success: true, pet: updated as Pet, foundReport }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

function buildRecoveryEmailHtml({ petName, baseUrl }: { petName: string; baseUrl: string }): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h1 style="font-size:24px;margin-bottom:8px">🎉 Great news!</h1>
  <p style="font-size:16px;color:#444">
    <strong>${petName}</strong> has been found and is safely back home.
    Thank you for taking the time to submit a report — it really made a difference.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
  <p style="font-size:12px;color:#888">
    You received this because you submitted a found pet report on
    <a href="${baseUrl}" style="color:#7c3aed">PetID</a>.
  </p>
</body>
</html>`
}
