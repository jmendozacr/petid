import { describe, it, expect, beforeEach, vi } from 'vitest'
import QRCodeStyling from 'qr-code-styling'
import { getPublicPetUrl, sanitizePetName, downloadQRCode, QR_PRESETS } from './qr-code'

const mockDownload = vi.hoisted(() => vi.fn())

vi.mock('qr-code-styling', () => ({
  default: vi.fn().mockImplementation(function () {
    return { append: vi.fn(), update: vi.fn(), download: mockDownload }
  }),
}))

const MockQRCodeStyling = vi.mocked(QRCodeStyling)

describe('qr-code', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL
    mockDownload.mockReset()
    MockQRCodeStyling.mockClear()
  })

  describe('getPublicPetUrl', () => {
    it('should return URL with localhost base in development', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      const result = getPublicPetUrl('pet-123')
      expect(result).toContain('/p/pet-123')
      expect(result).toBe('http://localhost:3000/p/pet-123')
    })

    it('should include pet ID in URL', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
      expect(getPublicPetUrl('abc-123-def')).toBe('http://localhost:3000/p/abc-123-def')
    })

    it('should use NEXT_PUBLIC_BASE_URL when available', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://petid.app'
      expect(getPublicPetUrl('pet-456')).toBe('https://petid.app/p/pet-456')
    })

    it('should fallback to petid.app when no base URL is set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      expect(getPublicPetUrl('pet-789')).toBe('https://petid.app/p/pet-789')
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
    beforeEach(() => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://petid.app'
      mockDownload.mockResolvedValue(undefined)
    })

    it('calls .download() with png extension (REQ-05.1)', async () => {
      await downloadQRCode('pet-123', 'Bella')
      expect(mockDownload).toHaveBeenCalledWith(
        expect.objectContaining({ extension: 'png' }),
      )
    })

    it('creates QRCodeStyling with 600x600 dimensions (REQ-05.2)', async () => {
      await downloadQRCode('pet-123', 'Bella')
      expect(MockQRCodeStyling).toHaveBeenCalledWith(
        expect.objectContaining({ width: 600, height: 600 }),
      )
    })

    it('uses sanitized pet name in filename (REQ-06.1)', async () => {
      await downloadQRCode('pet-123', 'José García')
      expect(mockDownload).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'jose-garcia-qrcode' }),
      )
    })

    it('falls back to pet-qrcode for invalid name (REQ-06.2)', async () => {
      await downloadQRCode('pet-123', '---')
      expect(mockDownload).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'pet-qrcode' }),
      )
    })

    it('uses pet-tag preset config by default (REQ-07.1)', async () => {
      await downloadQRCode('pet-123', 'Bella')
      expect(MockQRCodeStyling).toHaveBeenCalledWith(
        expect.objectContaining({ ...QR_PRESETS['pet-tag'] }),
      )
    })

    it('uses premium preset config when specified (REQ-07.1)', async () => {
      await downloadQRCode('pet-123', 'Bella', 'premium')
      expect(MockQRCodeStyling).toHaveBeenCalledWith(
        expect.objectContaining({ ...QR_PRESETS['premium'] }),
      )
    })

    it('includes paw image in constructor options (REQ-04.1)', async () => {
      await downloadQRCode('pet-123', 'Bella')
      expect(MockQRCodeStyling).toHaveBeenCalledWith(
        expect.objectContaining({ image: expect.stringContaining('data:image/svg+xml') }),
      )
    })

    it('sets errorCorrectionLevel H (REQ-04.2)', async () => {
      await downloadQRCode('pet-123', 'Bella')
      expect(MockQRCodeStyling).toHaveBeenCalledWith(
        expect.objectContaining({
          qrOptions: expect.objectContaining({ errorCorrectionLevel: 'H' }),
        }),
      )
    })

    it('passes the correct public pet URL as data', async () => {
      await downloadQRCode('pet-123', 'Bella')
      expect(MockQRCodeStyling).toHaveBeenCalledWith(
        expect.objectContaining({ data: 'https://petid.app/p/pet-123' }),
      )
    })

    it('propagates errors from .download()', async () => {
      mockDownload.mockRejectedValue(new Error('Download failed'))
      await expect(downloadQRCode('pet-123', 'Bella')).rejects.toThrow('Download failed')
    })
  })

  describe('QR_PRESETS', () => {
    it('each preset has distinct dotsOptions color (REQ-01.2)', () => {
      const colors = Object.values(QR_PRESETS).map((p) => p.dotsOptions.color)
      const unique = new Set(colors)
      expect(unique.size).toBe(3)
    })
  })
})
