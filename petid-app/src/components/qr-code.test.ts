import { describe, it, expect, beforeEach } from 'vitest'
import { getPublicPetUrl } from './qr-code'

describe('qr-code', () => {
  beforeEach(() => {
    // Reset env before each test
    delete process.env.NEXT_PUBLIC_BASE_URL
  })

  describe('getPublicPetUrl', () => {
    it('should return URL with localhost base in development', () => {
      // Set local URL
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      const result = getPublicPetUrl('pet-123')
      
      expect(result).toContain('/p/pet-123')
      expect(result).toBe('http://localhost:3000/p/pet-123')
    })

    it('should include pet ID in URL', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      const petId = 'abc-123-def'
      const result = getPublicPetUrl(petId)
      
      expect(result).toBe(`http://localhost:3000/p/${petId}`)
    })

    it('should use NEXT_PUBLIC_BASE_URL when available', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://petid.app'
      
      const result = getPublicPetUrl('pet-456')
      
      expect(result).toBe('https://petid.app/p/pet-456')
    })

    it('should fallback to petid.app when no base URL is set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      
      const result = getPublicPetUrl('pet-789')
      
      expect(result).toBe('https://petid.app/p/pet-789')
    })
  })
})
