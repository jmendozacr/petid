'use client'

import { useState } from 'react'
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

export function HealthRecordForm({ onSubmit, isSubmitting }: HealthRecordFormProps) {
  const t = useTranslations('healthRecord')
  const [formData, setFormData] = useState<NewRecordData>({
    type: 'vaccine',
    description: '',
    record_date: new Date().toISOString().split('T')[0],
    next_due_date: null,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description.trim()) {
      setError(t('descriptionRequired'))
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
            <Label>{t('description')}</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>{t('save')}</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
