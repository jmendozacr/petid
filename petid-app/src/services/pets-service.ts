import { createClient } from '@/lib/supabase/client'
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

export async function uploadPetPhoto(petId: string, file: File): Promise<string> {
  const supabase = createClient()
  const filePath = `pets/${petId}/${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('pet-photos')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('pet-photos')
    .getPublicUrl(filePath)

  return publicUrl
}
