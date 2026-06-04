'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { PhotoDisplay } from '@/components/ui/photo-display'

interface PetPhotoUploadProps {
  photoUrl: string | null
  uploading: boolean
  onPhotoChange: (file: File) => void
  alt: string
}

export function PetPhotoUpload({ photoUrl, uploading, onPhotoChange, alt }: PetPhotoUploadProps) {
  const t = useTranslations('petDetail')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onPhotoChange(file)
  }

  return (
    <div className="flex-shrink-0">
      <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted relative">
        <PhotoDisplay photoUrl={photoUrl} alt={alt} />
        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
          <span className="text-white text-sm font-medium">
            {uploading ? t('uploading') : t('uploadPhoto')}
          </span>
        </label>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-2 w-48 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label={uploading ? t('uploading') : t('uploadPhoto')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{uploading ? t('uploading') : t('uploadPhoto')}</span>
      </button>
    </div>
  )
}
