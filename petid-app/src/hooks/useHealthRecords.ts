import { useState, useEffect } from 'react'
import { getHealthRecords, createHealthRecord, deleteHealthRecord } from '@/services/health-record-service'
import type { HealthRecord, HealthRecordType } from '@/types/health-record'

export type NewRecordData = {
  type: HealthRecordType
  description: string
  record_date: string
  next_due_date?: string | null
}

export function useHealthRecords(petId: string) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadRecords() {
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
  }

  useEffect(() => {
    loadRecords()
  }, [petId])

  async function add(data: NewRecordData) {
    const tempId = `temp-${Date.now()}`
    const optimisticRecord: HealthRecord = {
      id: tempId,
      pet_id: petId,
      created_at: new Date().toISOString(),
      ...data,
    }
    setRecords(prev => [optimisticRecord, ...prev])
    try {
      const newRecord = await createHealthRecord({ pet_id: petId, ...data })
      setRecords(prev => prev.map(r => r.id === tempId ? newRecord : r))
      return newRecord
    } catch (err) {
      setRecords(prev => prev.filter(r => r.id !== tempId))
      throw err
    }
  }

  async function remove(id: string) {
    const previous = records
    setRecords(prev => prev.filter(r => r.id !== id))
    try {
      await deleteHealthRecord(id)
    } catch (err) {
      setRecords(previous)
      throw err
    }
  }

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
