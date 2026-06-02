import { useState, useCallback, useEffect } from 'react'
import { createPet, uploadPetPhoto, updatePet } from '@/services/pets-service'
import type { Pet } from '@/types/pet'

export type PetFormData = {
  name: string
  species: string
  breed: string
  birthdate: string
  color: string
  weight: string
  microchip_id: string
  owner_phone: string
  emergency_contact: string
}

export const initialFormData: PetFormData = {
  name: '',
  species: '',
  breed: '',
  birthdate: '',
  color: '',
  weight: '',
  microchip_id: '',
  owner_phone: '',
  emergency_contact: '',
}

function petToFormData(pet: Pet): PetFormData {
  return {
    name: pet.name,
    species: pet.species ?? '',
    breed: pet.breed ?? '',
    birthdate: pet.birthdate ?? '',
    color: pet.color ?? '',
    weight: pet.weight?.toString() ?? '',
    microchip_id: pet.microchip_id ?? '',
    owner_phone: pet.owner_phone ?? '',
    emergency_contact: pet.emergency_contact ?? '',
  }
}

export function usePetForm(initialPet?: Pet) {
  const [formData, setFormData] = useState<PetFormData>(
    initialPet ? petToFormData(initialPet) : initialFormData
  )
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync when initialPet arrives async (e.g. after usePet resolves on edit page).
  useEffect(() => {
    if (initialPet) {
      setFormData(petToFormData(initialPet))
    }
    // Keyed on ID only — re-init when the pet identity changes, not on every partial field update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPet?.id])

  const handleChange = useCallback((field: keyof PetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handlePhotoChange = useCallback((file: File | null) => {
    setPendingPhoto(file)
  }, [])

  const submit = useCallback(async (): Promise<Pet | null> => {
    if (!formData.name.trim()) {
      setError('El nombre de la mascota es requerido')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const petData = {
        name: formData.name,
        species: formData.species || null,
        breed: formData.breed || null,
        birthdate: formData.birthdate || null,
        color: formData.color || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        microchip_id: formData.microchip_id || null,
        owner_phone: formData.owner_phone || null,
        emergency_contact: formData.emergency_contact || null,
      }

      if (initialPet) {
        return await updatePet(initialPet.id, petData)
      }

      let pet = await createPet(petData)

      if (pendingPhoto) {
        const photoUrl = await uploadPetPhoto(pet.id, pendingPhoto)
        pet = await updatePet(pet.id, { photo_url: photoUrl })
      }

      return pet
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pet')
      return null
    } finally {
      setLoading(false)
    }
  }, [formData, pendingPhoto, initialPet])

  const reset = useCallback(() => {
    setFormData(initialPet ? petToFormData(initialPet) : initialFormData)
    setPendingPhoto(null)
    setError(null)
  }, [initialPet])

  return {
    formData,
    pendingPhoto,
    loading,
    error,
    handleChange,
    handlePhotoChange,
    submit,
    reset,
    setError,
  }
}
