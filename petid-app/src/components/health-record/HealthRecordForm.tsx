import { useState } from 'react'
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
  const [formData, setFormData] = useState<NewRecordData>({
    type: 'vaccine',
    description: '',
    record_date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description.trim()) {
      setError('La descripción es requerida')
      return
    }
    setError(null)
    onSubmit(formData)
    setFormData({
      type: 'vaccine',
      description: '',
      record_date: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Health Record</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div role="alert" className="text-sm text-danger p-3 rounded-md bg-danger/10">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="record-type">Type</Label>
            <Select
              id="record-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NewRecordData['type'] })}
            >
              <option value="vaccine">Vaccine</option>
              <option value="allergy">Allergy</option>
              <option value="medical_note">Medical Note</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.record_date}
              onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter details..."
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>Save Record</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
