import { useState, useCallback, useEffect } from 'react'
import { getPetById, updatePet, deletePet, uploadPetPhoto } from '@/services/pets-service'
import type { Pet } from '@/types/pet'

export function usePet(petId: string) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    const updated = await updatePet(petId, petData)
    setPet(updated)
    return updated
  }, [petId])

  const remove = useCallback(async () => {
    await deletePet(petId)
  }, [petId])

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
