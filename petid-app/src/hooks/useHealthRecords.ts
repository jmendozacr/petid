import { useState, useCallback, useEffect } from 'react'
import { getHealthRecords, createHealthRecord, deleteHealthRecord } from '@/services/health-record-service'
import type { HealthRecord } from '@/types/health-record'

export type NewRecordData = {
  type: 'vaccine' | 'allergy' | 'medical_note'
  description: string
  record_date: string
}

export function useHealthRecords(petId: string) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHealthRecords(petId)
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [petId])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const add = useCallback(async (data: Omit<NewRecordData, 'description' | 'record_date'> & { description: string; record_date: string }) => {
    const newRecord = await createHealthRecord({
      pet_id: petId,
      ...data,
    })
    setRecords(prev => [newRecord, ...prev])
    return newRecord
  }, [petId])

  const remove = useCallback(async (id: string) => {
    const previous = records
    setRecords(prev => prev.filter(r => r.id !== id))
    try {
      await deleteHealthRecord(id)
    } catch (err) {
      setRecords(previous)
      throw err
    }
  }, [records])

  const vaccines = records.filter(r => r.type === 'vaccine')
  const allergies = records.filter(r => r.type === 'allergy')
  const medicalNotes = records.filter(r => r.type === 'medical_note')

  return {
    records,
    loading,
    error,
    vaccines,
    allergies,
    medicalNotes,
    add,
    remove,
    reload: loadRecords,
  }
}
