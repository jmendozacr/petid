'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PetFormData } from '@/hooks/usePetForm'

interface PetFormFieldsProps {
  formData: PetFormData
  onChange: (field: keyof PetFormData, value: string) => void
  error?: string | null
}

export function PetFormFields({ formData, onChange, error }: PetFormFieldsProps) {
  const t = useTranslations('petForm')

  return (
    <>
      {error && (
        <div role="alert" className="text-sm text-danger p-3 rounded-md bg-danger/10">
          {error}
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
