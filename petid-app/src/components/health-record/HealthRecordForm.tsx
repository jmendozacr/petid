'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import type { NewRecordData } from '@/hooks/useHealthRecords'

interface HealthRecordFormProps {
  onSubmit: (data: NewRecordData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function HealthRecordForm({ onSubmit, onCancel, isSubmitting }: HealthRecordFormProps) {
  const t = useTranslations('healthRecord')
  const [formData, setFormData] = useState<NewRecordData>({
    type: 'vaccine',
    description: '',
    record_date: new Date().toISOString().split('T')[0],
    next_due_date: null,
  })
  const [error, setError] = useState<string | null>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description.trim()) {
      setError(t('descriptionRequired'))
      descriptionRef.current?.focus()
      return
    }
    setError(null)
    onSubmit(formData)
    setFormData({
      type: 'vaccine',
      description: '',
      record_date: new Date().toISOString().split('T')[0],
      next_due_date: null,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('addTitle')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div role="alert" className="text-sm text-danger p-3 rounded-md bg-danger/10">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="record-type">{t('type')}</Label>
            <Select
              id="record-type"
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value as NewRecordData['type']
                setFormData({ ...formData, type: newType, next_due_date: newType === 'vaccine' ? formData.next_due_date : null })
              }}
            >
              <option value="vaccine">{t('vaccine')}</option>
              <option value="allergy">{t('allergy')}</option>
              <option value="medical_note">{t('medicalNote')}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('date')}</Label>
            <Input
              type="date"
              value={formData.record_date}
              onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
            />
          </div>
          {formData.type === 'vaccine' && (
            <div className="space-y-2">
              <Label htmlFor="next-due-date">{t('nextDueDate')}</Label>
              <Input
                id="next-due-date"
                type="date"
                value={formData.next_due_date ?? ''}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value || null })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <textarea
              id="description"
              ref={descriptionRef}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t('descriptionPlaceholder')}
              aria-invalid={!!error || undefined}
            />
            {error && (
              <p className="text-sm text-danger mt-1">{error}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{t('save')}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>{t('cancel')}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
