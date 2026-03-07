import { describe, it, expect, beforeEach } from 'vitest'
import { usePetStore } from './pet-store'
import type { Pet } from '@/types/pet'

describe('pet-store', () => {
  beforeEach(() => {
    // Reset store before each test
    usePetStore.setState({
      pets: [],
      selectedPet: null,
      isLoading: false,
      error: null,
    })
  })

  const mockPet: Pet = {
    id: '1',
    user_id: 'user-1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    birthdate: '2020-01-15',
    color: 'Golden',
    weight: 30,
    microchip_id: 'ABC123',
    photo_url: null,
    owner_phone: '+1234567890',
    emergency_contact: '+0987654321',
    created_at: '2024-01-01T00:00:00Z',
  }

  describe('setPets', () => {
    it('should set pets array', () => {
      const pets = [mockPet]
      usePetStore.getState().setPets(pets)
      
      expect(usePetStore.getState().pets).toEqual(pets)
      expect(usePetStore.getState().error).toBeNull()
    })
  })

  describe('addPet', () => {
    it('should add a pet to the pets array', () => {
      usePetStore.getState().addPet(mockPet)
      
      expect(usePetStore.getState().pets).toHaveLength(1)
      expect(usePetStore.getState().pets[0].name).toBe('Buddy')
    })

    it('should append pet to existing pets', () => {
      const pet2 = { ...mockPet, id: '2', name: 'Max' }
      usePetStore.getState().addPet(mockPet)
      usePetStore.getState().addPet(pet2)
      
      expect(usePetStore.getState().pets).toHaveLength(2)
    })
  })

  describe('updatePet', () => {
    it('should update an existing pet', () => {
      usePetStore.getState().addPet(mockPet)
      const updatedPet = { ...mockPet, name: 'Buddy Jr.' }
      
      usePetStore.getState().updatePet(updatedPet)
      
      expect(usePetStore.getState().pets[0].name).toBe('Buddy Jr.')
    })

    it('should update selectedPet if it is the same pet', () => {
      usePetStore.getState().setSelectedPet(mockPet)
      const updatedPet = { ...mockPet, name: 'Buddy Jr.' }
      
      usePetStore.getState().updatePet(updatedPet)
      
      expect(usePetStore.getState().selectedPet?.name).toBe('Buddy Jr.')
    })
  })

  describe('removePet', () => {
    it('should remove a pet from the pets array', () => {
      usePetStore.getState().addPet(mockPet)
      
      usePetStore.getState().removePet('1')
      
      expect(usePetStore.getState().pets).toHaveLength(0)
    })

    it('should set selectedPet to null if removed pet was selected', () => {
      usePetStore.getState().setSelectedPet(mockPet)
      
      usePetStore.getState().removePet('1')
      
      expect(usePetStore.getState().selectedPet).toBeNull()
    })
  })

  describe('setSelectedPet', () => {
    it('should set the selected pet', () => {
      usePetStore.getState().setSelectedPet(mockPet)
      
      expect(usePetStore.getState().selectedPet).toEqual(mockPet)
    })

    it('should allow setting selectedPet to null', () => {
      usePetStore.getState().setSelectedPet(mockPet)
      usePetStore.getState().setSelectedPet(null)
      
      expect(usePetStore.getState().selectedPet).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      usePetStore.getState().setLoading(true)
      
      expect(usePetStore.getState().isLoading).toBe(true)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      usePetStore.getState().setError('Something went wrong')
      
      expect(usePetStore.getState().error).toBe('Something went wrong')
    })

    it('should reset loading when setting error', () => {
      usePetStore.getState().setLoading(true)
      usePetStore.getState().setError('Error')
      
      expect(usePetStore.getState().isLoading).toBe(false)
    })
  })
})
