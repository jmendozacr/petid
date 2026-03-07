import QRCodeLib from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export async function QRCode({ value, size = 200, className }: QRCodeProps) {
  const dataUrl = await QRCodeLib.toDataURL(value, {
    width: size,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })

  return (
    <img
      src={dataUrl}
      alt={`QR code for ${value}`}
      className={className}
      width={size}
      height={size}
    />
  )
}

export function getPublicPetUrl(petId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://petid.app'
  return `${baseUrl}/p/${petId}`
}
