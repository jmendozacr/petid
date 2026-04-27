import { useState, useCallback, useEffect } from 'react'
import { getPetById, updatePet as updatePetService, deletePet, uploadPetPhoto } from '@/services/pets-service'
import { usePetStore } from '@/stores/pet-store'
import type { Pet } from '@/types/pet'

export function usePet(petId: string) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateInStore = usePetStore((state) => state.updatePet)
  const removeFromStore = usePetStore((state) => state.removePet)

  const loadPet = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPetById(petId)
      setPet(data)
      if (!data) {
        setError('Pet not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pet')
    } finally {
      setLoading(false)
    }
  }, [petId])

  useEffect(() => {
    loadPet()
  }, [loadPet])

  const update = useCallback(async (petData: Partial<Pet>) => {
    const updated = await updatePetService(petId, petData)
    setPet(updated)
    updateInStore(updated)
    return updated
  }, [petId, updateInStore])

  const remove = useCallback(async () => {
    await deletePet(petId)
    removeFromStore(petId)
  }, [petId, removeFromStore])

  const uploadPhoto = useCallback(async (file: File) => {
    const photoUrl = await uploadPetPhoto(petId, file)
    await update({ photo_url: photoUrl })
    return photoUrl
  }, [petId, update])

  return {
    pet,
    loading,
    error,
    update,
    remove,
    uploadPhoto,
    reload: loadPet,
  }
}
