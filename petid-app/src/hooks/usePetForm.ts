import { useState, useCallback } from 'react'
import { createPet } from '@/services/pets-service'
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

export function usePetForm() {
  const [formData, setFormData] = useState<PetFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((field: keyof PetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

      const pet = await createPet(petData)
      return pet
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pet')
      return null
    } finally {
      setLoading(false)
    }
  }, [formData])

  const reset = useCallback(() => {
    setFormData(initialFormData)
    setError(null)
  }, [])

  return {
    formData,
    loading,
    error,
    handleChange,
    submit,
    reset,
    setError,
  }
}
