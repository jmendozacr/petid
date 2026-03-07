import { create } from 'zustand'
import type { PetStore, Pet, PetState } from '@/types/pet'

export const defaultPetState: PetState = {
  pets: [],
  selectedPet: null,
  isLoading: false,
  error: null,
}

export const usePetStore = create<PetStore>()((set) => ({
  ...defaultPetState,

  setPets: (pets: Pet[]) => set({ pets, error: null }),

  addPet: (pet: Pet) => set((state) => ({ 
    pets: [...state.pets, pet] 
  })),

  updatePet: (updatedPet: Pet) => set((state) => ({
    pets: state.pets.map((pet) => 
      pet.id === updatedPet.id ? updatedPet : pet
    ),
    selectedPet: state.selectedPet?.id === updatedPet.id 
      ? updatedPet 
      : state.selectedPet,
  })),

  removePet: (id: string) => set((state) => ({
    pets: state.pets.filter((pet) => pet.id !== id),
    selectedPet: state.selectedPet?.id === id ? null : state.selectedPet,
  })),

  setSelectedPet: (pet: Pet | null) => set({ selectedPet: pet }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error, isLoading: false }),
}))
