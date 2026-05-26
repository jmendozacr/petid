import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image-utils'
import type { Pet } from '@/types/pet'

export async function getPets(): Promise<Pet[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in')
  }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data as Pet[]
}

export async function getPetById(id: string): Promise<Pet | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as Pet
}

export async function createPet(petData: Partial<Pet> & { name: string }): Promise<Pet> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in')
  }

  const { data, error } = await supabase
    .from('pets')
    .insert({ ...petData, user_id: user.id })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Pet
}

export async function updatePet(id: string, petData: Partial<Pet>): Promise<Pet> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('pets')
    .update(petData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Pet
}

export async function toggleLostStatus(petId: string, isLost: boolean): Promise<Pet> {
  const supabase = createClient()

  // Invariant: lost_since must be null when is_lost is false
  const update = isLost
    ? { is_lost: true, lost_since: new Date().toISOString() }
    : { is_lost: false, lost_since: null }

  const { data, error } = await supabase
    .from('pets')
    .update(update)
    .eq('id', petId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Pet
}

export async function deletePet(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024

async function uploadImageToStorage(bucket: string, path: string, file: File): Promise<string> {
  const compressed = await compressImage(file)
  const supabase = createClient()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, { upsert: true })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) throw new Error('File must be an image')
  if (file.size > MAX_PHOTO_SIZE) throw new Error('File must be under 5MB')
}

export async function uploadPetPhoto(petId: string, file: File): Promise<string> {
  validateImageFile(file)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  return uploadImageToStorage('pet-photos', `pets/${petId}/photo.${ext}`, file)
}

export async function uploadReportPhoto(reportId: string, file: File): Promise<string> {
  validateImageFile(file)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  return uploadImageToStorage('pet-photos', `reports/${reportId}/photo.${ext}`, file)
}
