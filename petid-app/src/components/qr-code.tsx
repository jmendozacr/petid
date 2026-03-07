'use client'

import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export function QRCode({ value, size = 200, className }: QRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    async function generateQR() {
      const url = await QRCodeLib.toDataURL(value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      setDataUrl(url)
    }
    generateQR()
  }, [value, size])

  if (!dataUrl) {
    return <div className={`bg-muted ${className}`} style={{ width: size, height: size }} />
  }

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
