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
  is_lost: boolean
  lost_since: string | null
  lost_lat: number | null
  lost_lng: number | null
  created_at: string
}

export interface FoundReport {
  contact: string
  message: string | null
}

export type ToggleLostPetResult = {
  success: boolean
  pet?: Pet
  foundReport?: FoundReport
  error?: string
}

export type LostStatusUpdate = {
  is_lost: boolean
  lost_since: string | null
}

export type PetState = {
  pets: Pet[]
  isLoading: boolean
  error: string | null
}

export type PetActions = {
  setPets: (pets: Pet[]) => void
  addPet: (pet: Pet) => void
  updatePet: (pet: Pet) => void
  removePet: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export type PetStore = PetState & PetActions
