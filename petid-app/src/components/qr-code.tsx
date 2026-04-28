'use client'

import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'

export function sanitizePetName(name: string): string {
  const result = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['''`]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return result.length === 0 ? 'pet' : result
}

export async function downloadQRCode(petId: string, petName: string): Promise<void> {
  const qrValue = getPublicPetUrl(petId)
  const dataUrl = await QRCodeLib.toDataURL(qrValue, {
    type: 'image/png',
    width: 600,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const uint8 = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i)
  const blob = new Blob([uint8], { type: 'image/png' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `${sanitizePetName(petName)}-qrcode.png`
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

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
