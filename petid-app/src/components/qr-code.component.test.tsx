import { describe, it, expect, vi, act } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { QRCode } from './qr-code'

const mockToDataURL = vi.hoisted(() => vi.fn())

vi.mock('qrcode', () => ({
  default: { toDataURL: mockToDataURL },
}))

describe('QRCode component', () => {
  it('renders placeholder div while dataUrl is loading', () => {
    mockToDataURL.mockReturnValue(new Promise(() => {}))
    const { container } = render(<QRCode value="https://petid.app/p/1" />)
    expect(container.querySelector('div.bg-muted')).not.toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders img element after QR code is generated', async () => {
    mockToDataURL.mockResolvedValue('data:image/png;base64,abc')
    render(<QRCode value="https://petid.app/p/1" />)
    expect(await screen.findByRole('img')).toBeInTheDocument()
  })
})
