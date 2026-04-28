'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Pet } from '@/types/pet'

export async function toggleLostPetStatus(
  petId: string,
  isLost: boolean
): Promise<{ success: boolean; pet?: Pet; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: pet } = await supabase
    .from('pets')
    .select('user_id')
    .eq('id', petId)
    .single()

  if (!pet) {
    return { success: false, error: 'Pet not found' }
  }

  if (pet.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Invariant: lost_since must be null when is_lost is false
    const update = isLost
      ? { is_lost: true, lost_since: new Date().toISOString() }
      : { is_lost: false, lost_since: null }

    const { data: updated, error } = await supabase
      .from('pets')
      .update(update)
      .eq('id', petId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath(`/p/${petId}`)
    revalidatePath(`/dashboard/pets/${petId}`)
    return { success: true, pet: updated as Pet }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
