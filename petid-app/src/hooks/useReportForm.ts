import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleChange = useCallback((field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const submit = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('found_reports')
        .insert({
          pet_id: petId,
          message: formData.message,
          location: formData.location,
        })

      if (insertError) {
        setError(insertError.message)
        return false
      }

      setSuccess(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
      return false
    } finally {
      setLoading(false)
    }
  }, [formData, petId, supabase])

  const reset = useCallback(() => {
    setFormData(initialReportFormData)
    setSuccess(false)
    setError(null)
  }, [])

  return {
    formData,
    loading,
    success,
    error,
    handleChange,
    submit,
    reset,
  }
}
