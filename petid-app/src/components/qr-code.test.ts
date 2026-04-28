import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getPublicPetUrl, sanitizePetName, downloadQRCode } from './qr-code'

const mockToDataURL = vi.hoisted(() => vi.fn())
const mockCreateObjectURL = vi.hoisted(() => vi.fn())
const mockRevokeObjectURL = vi.hoisted(() => vi.fn())

vi.mock('qrcode', () => ({
  default: {
    toDataURL: mockToDataURL,
  },
}))

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

  describe('sanitizePetName', () => {
    it('lowercases basic name', () => {
      expect(sanitizePetName('Bella')).toBe('bella')
    })

    it('converts spaces to hyphens', () => {
      expect(sanitizePetName('Max Jr')).toBe('max-jr')
    })

    it('removes apostrophes', () => {
      expect(sanitizePetName("Luna's Light")).toBe('lunas-light')
    })

    it('removes accented characters', () => {
      expect(sanitizePetName('José García')).toBe('jose-garcia')
      expect(sanitizePetName('Chloé')).toBe('chloe')
    })

    it('removes special characters', () => {
      expect(sanitizePetName('Mr. Whiskers')).toBe('mr-whiskers')
      expect(sanitizePetName('Buddy!@#')).toBe('buddy')
    })

    it('falls back to "pet" for empty/invalid input', () => {
      expect(sanitizePetName('')).toBe('pet')
      expect(sanitizePetName('   ')).toBe('pet')
      expect(sanitizePetName('@#$')).toBe('pet')
      expect(sanitizePetName('---')).toBe('pet')
    })

    it('collapses consecutive hyphens', () => {
      expect(sanitizePetName('a  b')).toBe('a-b')
    })
  })

  describe('downloadQRCode', () => {
    const fakeDataUrl = 'data:image/png;base64,aGVsbG8='

    beforeEach(() => {
      mockToDataURL.mockReset()
      mockCreateObjectURL.mockReset()
      mockRevokeObjectURL.mockReset()
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL
      mockCreateObjectURL.mockReturnValue('blob:fake-url')
    })

    it('calls click and revokes the object URL on successful download', async () => {
      mockToDataURL.mockResolvedValue(fakeDataUrl)
      const appendSpy = vi.spyOn(document.body, 'appendChild')

      await downloadQRCode('pet-123', 'Bella')

      const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement
      expect(anchor.click).toBeDefined()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:fake-url')

      appendSpy.mockRestore()
    })

    it('calls toDataURL with the correct QR value and options', async () => {
      mockToDataURL.mockResolvedValue(fakeDataUrl)

      process.env.NEXT_PUBLIC_BASE_URL = 'https://petid.app'
      await downloadQRCode('pet-123', 'Bella')

      expect(mockToDataURL).toHaveBeenCalledWith(
        getPublicPetUrl('pet-123'),
        expect.objectContaining({ width: 600, type: 'image/png' }),
      )
    })

    it('propagates errors from toDataURL', async () => {
      mockToDataURL.mockRejectedValue(new Error('QR generation failed'))

      await expect(downloadQRCode('pet-123', 'Bella')).rejects.toThrow('QR generation failed')
    })

    it('sets the correct filename on the anchor element', async () => {
      mockToDataURL.mockResolvedValue(fakeDataUrl)
      const appendSpy = vi.spyOn(document.body, 'appendChild')

      await downloadQRCode('pet-123', 'José García')

      const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement
      expect(anchor.download).toBe('jose-garcia-qrcode.png')

      appendSpy.mockRestore()
    })
  })
})
