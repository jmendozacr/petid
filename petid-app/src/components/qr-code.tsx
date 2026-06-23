'use client'

import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

export type QRPreset = 'pet-tag' | 'premium' | 'fresh'

const PAW_IMAGE =
  `data:image/svg+xml,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<ellipse cx="50" cy="68" rx="24" ry="20"/>` +
      `<ellipse cx="22" cy="48" rx="11" ry="14"/>` +
      `<ellipse cx="40" cy="35" rx="11" ry="14"/>` +
      `<ellipse cx="61" cy="35" rx="11" ry="14"/>` +
      `<ellipse cx="78" cy="48" rx="11" ry="14"/>` +
      `</svg>`,
  )

type PresetConfig = {
  dotsOptions: { type: string; color: string }
  cornersSquareOptions: { type: string; color: string }
  cornersDotOptions: { type: string; color: string }
  backgroundOptions: { color: string }
}

export const QR_PRESETS: Record<QRPreset, PresetConfig> = {
  'pet-tag': {
    dotsOptions: { type: 'rounded', color: '#FF8C42' },
    cornersSquareOptions: { type: 'extra-rounded', color: '#C45E1A' },
    cornersDotOptions: { type: 'dot', color: '#FF8C42' },
    backgroundOptions: { color: '#FFF8F0' },
  },
  premium: {
    dotsOptions: { type: 'dots', color: '#FFFFFF' },
    cornersSquareOptions: { type: 'square', color: '#FFFFFF' },
    cornersDotOptions: { type: 'dot', color: '#60A5FA' },
    backgroundOptions: { color: '#1A1A2E' },
  },
  fresh: {
    dotsOptions: { type: 'classy-rounded', color: '#2D9B83' },
    cornersSquareOptions: { type: 'extra-rounded', color: '#1B6B5A' },
    cornersDotOptions: { type: 'dot', color: '#2D9B83' },
    backgroundOptions: { color: '#FFFFFF' },
  },
}

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

export async function downloadQRCode(
  petId: string,
  petName: string,
  preset: QRPreset = 'pet-tag',
): Promise<void> {
  const qr = new QRCodeStyling({
    width: 600,
    height: 600,
    data: getPublicPetUrl(petId),
    image: PAW_IMAGE,
    imageOptions: { imageSize: 0.3, margin: 5, hideBackgroundDots: true },
    qrOptions: { errorCorrectionLevel: 'H' },
    ...QR_PRESETS[preset],
  })
  await qr.download({ name: `${sanitizePetName(petName)}-qrcode`, extension: 'png' })
}

export interface QRCodeProps {
  value: string
  preset?: QRPreset
  size?: number
  className?: string
}

export function QRCode({ value, preset = 'pet-tag', size = 200, className }: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data: value,
      image: PAW_IMAGE,
      imageOptions: { imageSize: 0.3, margin: 5, hideBackgroundDots: true },
      qrOptions: { errorCorrectionLevel: 'H' },
      ...QR_PRESETS[preset],
    })
    qr.append(containerRef.current!)
    qrRef.current = qr
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    qrRef.current?.update({
      width: size,
      height: size,
      data: value,
      ...QR_PRESETS[preset],
    })
  }, [value, preset, size])

  return <div ref={containerRef} className={className} />
}

export function getPublicPetUrl(petId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://petid.app'
  return `${baseUrl}/p/${petId}`
}
