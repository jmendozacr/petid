'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PetFormData } from '@/hooks/usePetForm'

interface PetFormFieldsProps {
  formData: PetFormData
  onChange: (field: keyof PetFormData, value: string) => void
  error?: string | null
  onPhotoChange?: (file: File | null) => void
  photoPreview?: string | null
}

export function PetFormFields({ formData, onChange, error, onPhotoChange, photoPreview }: PetFormFieldsProps) {
  const t = useTranslations('petForm')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    onPhotoChange?.(file)
  }

  return (
    <>
      {error && (
        <div role="alert" className="text-sm text-danger p-3 rounded-md bg-danger/10">
          {error}
        </div>
      )}

      {onPhotoChange && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors group cursor-pointer"
          >
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <span className="text-xs text-muted-foreground">{t('photoOptional')}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">{t('nameRequired')}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
          placeholder={t('namePlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="species">{t('species')}</Label>
          <Input
            id="species"
            value={formData.species}
            onChange={(e) => onChange('species', e.target.value)}
            placeholder={t('speciesPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="breed">{t('breed')}</Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => onChange('breed', e.target.value)}
            placeholder={t('breedPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthdate">{t('birthdate')}</Label>
          <Input
            id="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={(e) => onChange('birthdate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">{t('color')}</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => onChange('color', e.target.value)}
            placeholder={t('colorPlaceholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">{t('weight')}</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => onChange('weight', e.target.value)}
            placeholder="10.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="microchip_id">{t('microchip')}</Label>
          <Input
            id="microchip_id"
            value={formData.microchip_id}
            onChange={(e) => onChange('microchip_id', e.target.value)}
            placeholder="ABC123..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="owner_phone">{t('ownerPhone')}</Label>
          <Input
            id="owner_phone"
            type="tel"
            value={formData.owner_phone}
            onChange={(e) => onChange('owner_phone', e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergency_contact">{t('emergencyContact')}</Label>
          <Input
            id="emergency_contact"
            value={formData.emergency_contact}
            onChange={(e) => onChange('emergency_contact', e.target.value)}
            placeholder="Vet's phone..."
          />
        </div>
      </div>
    </>
  )
}
