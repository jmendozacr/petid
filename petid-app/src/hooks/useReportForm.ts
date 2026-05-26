import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadReportPhoto } from '@/services/pets-service'

export type ReportFormData = {
  message: string
  location: string
  contact: string
}

export const initialReportFormData: ReportFormData = {
  message: '',
  location: '',
  contact: '',
}

export function useReportForm(petId: string) {
  const [formData, setFormData] = useState<ReportFormData>(initialReportFormData)
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const handleChange = useCallback((field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handlePhotoChange = useCallback((file: File | null) => {
    setPhoto(file)
  }, [])

  const submit = useCallback(async (): Promise<boolean> => {
    if (!formData.message.trim()) {
      setError('El mensaje es requerido')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { data: report, error: insertError } = await supabase
        .from('found_reports')
        .insert({
          pet_id: petId,
          message: formData.message,
          location: formData.location,
          contact: formData.contact || null,
        })
        .select('id')
        .single()

      if (insertError || !report) {
        setError(insertError?.message ?? 'Failed to submit report')
        return false
      }

      if (photo) {
        const photoUrl = await uploadReportPhoto(report.id, photo)
        await supabase
          .from('found_reports')
          .update({ photo_url: photoUrl })
          .eq('id', report.id)
      }

      setSuccess(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
      return false
    } finally {
      setLoading(false)
    }
  }, [formData, petId, photo, supabase])

  const reset = useCallback(() => {
    setFormData(initialReportFormData)
    setPhoto(null)
    setSuccess(false)
    setError(null)
  }, [])

  return {
    formData,
    photo,
    loading,
    success,
    error,
    handleChange,
    handlePhotoChange,
    submit,
    reset,
  }
}
