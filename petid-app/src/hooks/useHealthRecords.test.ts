import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useHealthRecords } from './useHealthRecords'
import { getHealthRecords, createHealthRecord, deleteHealthRecord } from '@/services/health-record-service'
import type { HealthRecord } from '@/types/health-record'

vi.mock('@/services/health-record-service')

const mockVaccine: HealthRecord = {
  id: 'r1',
  pet_id: 'pet-1',
  type: 'vaccine',
  description: 'Rabies',
  record_date: '2024-01-15',
  created_at: '2024-01-15T00:00:00Z',
}

const mockAllergy: HealthRecord = {
  id: 'r2',
  pet_id: 'pet-1',
  type: 'allergy',
  description: 'Chicken allergy',
  record_date: '2024-02-01',
  created_at: '2024-02-01T00:00:00Z',
}

const mockNote: HealthRecord = {
  id: 'r3',
  pet_id: 'pet-1',
  type: 'medical_note',
  description: 'Annual checkup',
  record_date: '2024-03-01',
  created_at: '2024-03-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useHealthRecords', () => {
  it('loads records on mount', async () => {
    vi.mocked(getHealthRecords).mockResolvedValue([mockVaccine, mockAllergy])

    const { result } = renderHook(() => useHealthRecords('pet-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.records).toHaveLength(2)
  })

  it('splits records into vaccines, allergies, and medicalNotes', async () => {
    vi.mocked(getHealthRecords).mockResolvedValue([mockVaccine, mockAllergy, mockNote])

    const { result } = renderHook(() => useHealthRecords('pet-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.vaccines).toHaveLength(1)
    expect(result.current.allergies).toHaveLength(1)
    expect(result.current.medicalNotes).toHaveLength(1)
  })

  it('add prepends new record to list', async () => {
    vi.mocked(getHealthRecords).mockResolvedValue([mockVaccine])
    const newRecord: HealthRecord = { ...mockNote, id: 'r4' }
    vi.mocked(createHealthRecord).mockResolvedValue(newRecord)

    const { result } = renderHook(() => useHealthRecords('pet-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.add({ type: 'medical_note', description: 'Checkup', record_date: '2024-03-01' })
    })

    expect(result.current.records[0]).toEqual(newRecord)
    expect(result.current.records).toHaveLength(2)
  })

  it('remove optimistically removes record from list', async () => {
    vi.mocked(getHealthRecords).mockResolvedValue([mockVaccine, mockAllergy])
    vi.mocked(deleteHealthRecord).mockResolvedValue()

    const { result } = renderHook(() => useHealthRecords('pet-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.remove('r1')
    })

    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].id).toBe('r2')
  })

  it('remove reverts list on service error', async () => {
    vi.mocked(getHealthRecords).mockResolvedValue([mockVaccine, mockAllergy])
    vi.mocked(deleteHealthRecord).mockRejectedValue(new Error('Delete failed'))

    const { result } = renderHook(() => useHealthRecords('pet-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => { await result.current.remove('r1') })
    ).rejects.toThrow('Delete failed')

    expect(result.current.records).toHaveLength(2)
  })
})
