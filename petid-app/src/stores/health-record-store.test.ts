import { describe, it, expect, beforeEach } from 'vitest'
import { useHealthRecordStore } from './health-record-store'
import type { HealthRecord } from '@/types/health-record'

describe('health-record-store', () => {
  beforeEach(() => {
    useHealthRecordStore.setState({
      records: [],
      isLoading: false,
      error: null,
    })
  })

  const mockRecord: HealthRecord = {
    id: '1',
    pet_id: 'pet-1',
    type: 'vaccine',
    description: 'Rabies vaccine',
    record_date: '2024-01-15',
    created_at: '2024-01-15T00:00:00Z',
  }

  const mockAllergy: HealthRecord = {
    id: '2',
    pet_id: 'pet-1',
    type: 'allergy',
    description: 'Allergic to chicken',
    record_date: '2024-02-01',
    created_at: '2024-02-01T00:00:00Z',
  }

  const mockMedicalNote: HealthRecord = {
    id: '3',
    pet_id: 'pet-1',
    type: 'medical_note',
    description: 'Annual checkup - healthy',
    record_date: '2024-03-01',
    created_at: '2024-03-01T00:00:00Z',
  }

  describe('setRecords', () => {
    it('should set records array', () => {
      const records = [mockRecord, mockAllergy]
      useHealthRecordStore.getState().setRecords(records)
      
      expect(useHealthRecordStore.getState().records).toEqual(records)
      expect(useHealthRecordStore.getState().error).toBeNull()
    })
  })

  describe('addRecord', () => {
    it('should add a record to the records array', () => {
      useHealthRecordStore.getState().addRecord(mockRecord)
      
      expect(useHealthRecordStore.getState().records).toHaveLength(1)
      expect(useHealthRecordStore.getState().records[0].description).toBe('Rabies vaccine')
    })

    it('should append record to existing records', () => {
      useHealthRecordStore.getState().addRecord(mockRecord)
      useHealthRecordStore.getState().addRecord(mockAllergy)
      
      expect(useHealthRecordStore.getState().records).toHaveLength(2)
    })
  })

  describe('removeRecord', () => {
    it('should remove a record from the records array', () => {
      useHealthRecordStore.getState().setRecords([mockRecord, mockAllergy])
      
      useHealthRecordStore.getState().removeRecord('1')
      
      expect(useHealthRecordStore.getState().records).toHaveLength(1)
      expect(useHealthRecordStore.getState().records[0].id).toBe('2')
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      useHealthRecordStore.getState().setLoading(true)
      
      expect(useHealthRecordStore.getState().isLoading).toBe(true)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      useHealthRecordStore.getState().setError('Failed to load records')
      
      expect(useHealthRecordStore.getState().error).toBe('Failed to load records')
    })

    it('should reset loading when setting error', () => {
      useHealthRecordStore.getState().setLoading(true)
      useHealthRecordStore.getState().setError('Error')
      
      expect(useHealthRecordStore.getState().isLoading).toBe(false)
    })
  })
})
