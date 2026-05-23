import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/profile'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return data as Profile
}

export async function updateProfile(
  userId: string,
  data: { full_name?: string | null; phone?: string | null }
): Promise<{ error: string | null }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (error) return { error: error.message }

  return { error: null }
}
