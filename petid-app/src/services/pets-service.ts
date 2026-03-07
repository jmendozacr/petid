import { createClient } from '@/lib/supabase/client'
import { usePetStore } from '@/stores/pet-store'
import type { Pet } from '@/types/pet'

export async function fetchPets() {
  const supabase = createClient()
  const setPets = usePetStore.getState().setPets
  const setLoading = usePetStore.getState().setLoading
  const setError = usePetStore.getState().setError

  setLoading(true)
  
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    setError(error.message)
  } else {
    setPets(data as Pet[])
  }
  
  setLoading(false)
}

export async function createPet(petData: Partial<Pet>): Promise<Pet | null> {
  const supabase = createClient()
  const addPet = usePetStore.getState().addPet
  const setLoading = usePetStore.getState().setLoading
  const setError = usePetStore.getState().setError

  setLoading(true)

  const { data, error } = await supabase
    .from('pets')
    .insert(petData)
    .select()
    .single()

  if (error) {
    setError(error.message)
    setLoading(false)
    return null
  }

  addPet(data as Pet)
  setLoading(false)
  return data as Pet
}

export async function updatePet(id: string, petData: Partial<Pet>): Promise<Pet | null> {
  const supabase = createClient()
  const updatePet = usePetStore.getState().updatePet
  const setLoading = usePetStore.getState().setLoading
  const setError = usePetStore.getState().setError

  setLoading(true)

  const { data, error } = await supabase
    .from('pets')
    .update(petData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    setError(error.message)
    setLoading(false)
    return null
  }

  updatePet(data as Pet)
  setLoading(false)
  return data as Pet
}

export async function deletePet(id: string): Promise<boolean> {
  const supabase = createClient()
  const removePet = usePetStore.getState().removePet
  const setLoading = usePetStore.getState().setLoading
  const setError = usePetStore.getState().setError

  setLoading(true)

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)

  if (error) {
    setError(error.message)
    setLoading(false)
    return false
  }

  removePet(id)
  setLoading(false)
  return true
}

export async function uploadPetPhoto(petId: string, file: File): Promise<string | null> {
  const supabase = createClient()
  const filePath = `pets/${petId}/${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('pet-photos')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('pet-photos')
    .getPublicUrl(filePath)

  return publicUrl
}
