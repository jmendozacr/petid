export type Pet = {
  id: string
  user_id: string
  name: string
  species: string | null
  breed: string | null
  birthdate: string | null
  color: string | null
  weight: number | null
  microchip_id: string | null
  photo_url: string | null
  owner_phone: string | null
  emergency_contact: string | null
  created_at: string
}

export type PetState = {
  pets: Pet[]
  selectedPet: Pet | null
  isLoading: boolean
  error: string | null
}

export type PetActions = {
  setPets: (pets: Pet[]) => void
  addPet: (pet: Pet) => void
  updatePet: (pet: Pet) => void
  removePet: (id: string) => void
  setSelectedPet: (pet: Pet | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export type PetStore = PetState & PetActions

export const defaultPetState: PetState = {
  pets: [],
  selectedPet: null,
  isLoading: false,
  error: null,
}
