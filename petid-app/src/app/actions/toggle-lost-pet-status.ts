'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { toggleLostStatus } from '@/services/pets-service'
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
    const updated = await toggleLostStatus(petId, isLost)
    revalidatePath(`/p/${petId}`)
    revalidatePath(`/dashboard/pets/${petId}`)
    return { success: true, pet: updated }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
