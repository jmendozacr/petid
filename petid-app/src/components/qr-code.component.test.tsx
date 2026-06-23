import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import QRCodeStyling from 'qr-code-styling'
import { QRCode, QR_PRESETS } from './qr-code'

const mockAppend = vi.hoisted(() => vi.fn())
const mockUpdate = vi.hoisted(() => vi.fn())
const mockDownload = vi.hoisted(() => vi.fn())

vi.mock('qr-code-styling', () => ({
  default: vi.fn().mockImplementation(function () {
    return { append: mockAppend, update: mockUpdate, download: mockDownload }
  }),
}))

const MockQRCodeStyling = vi.mocked(QRCodeStyling)

describe('QRCode component', () => {
  beforeEach(() => {
    mockAppend.mockReset()
    mockUpdate.mockReset()
    mockDownload.mockReset()
    MockQRCodeStyling.mockClear()
  })

  it('calls append on the container div after mount', () => {
    const { container } = render(<QRCode value="https://petid.app/p/1" />)
    const div = container.querySelector('div')
    expect(mockAppend).toHaveBeenCalledWith(div)
  })

  it('creates QRCodeStyling instance with pet-tag preset by default', () => {
    render(<QRCode value="https://petid.app/p/1" />)
    expect(MockQRCodeStyling).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'https://petid.app/p/1',
        ...QR_PRESETS['pet-tag'],
        qrOptions: expect.objectContaining({ errorCorrectionLevel: 'H' }),
      }),
    )
  })

  it('calls update when preset prop changes', () => {
    const { rerender } = render(<QRCode value="https://petid.app/p/1" preset="pet-tag" />)
    rerender(<QRCode value="https://petid.app/p/1" preset="premium" />)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ ...QR_PRESETS['premium'] }),
    )
  })

  it('renders a div container (not an img)', () => {
    render(<QRCode value="https://petid.app/p/1" />)
    expect(screen.queryByRole('img')).toBeNull()
  })
})

describe('QR_PRESETS config', () => {
  it('defines exactly 3 presets', () => {
    expect(Object.keys(QR_PRESETS)).toHaveLength(3)
    expect(QR_PRESETS).toHaveProperty('pet-tag')
    expect(QR_PRESETS).toHaveProperty('premium')
    expect(QR_PRESETS).toHaveProperty('fresh')
  })

  it('all presets have the required style properties', () => {
    for (const preset of Object.values(QR_PRESETS)) {
      expect(preset).toHaveProperty('dotsOptions')
      expect(preset).toHaveProperty('cornersSquareOptions')
      expect(preset).toHaveProperty('cornersDotOptions')
      expect(preset).toHaveProperty('backgroundOptions')
    }
  })
})
