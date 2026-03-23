import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getHealthRecords, createHealthRecord, deleteHealthRecord } from './health-record-service'
import type { HealthRecord } from '@/types/health-record'

const { mockTerminal, mockDeleteEq } = vi.hoisted(() => ({
  mockTerminal: vi.fn(),
  mockDeleteEq: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const c: Record<string, unknown> = {}
    c.select = () => c
    c.eq = () => c
    c.order = mockTerminal
    c.single = mockTerminal
    c.insert = () => c
    c.delete = () => ({ eq: mockDeleteEq })
    return { from: () => c }
  },
}))

const mockRecord: HealthRecord = {
  id: 'r1',
  pet_id: 'pet-1',
  type: 'vaccine',
  description: 'Rabies vaccine',
  record_date: '2024-01-15',
  created_at: '2024-01-15T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getHealthRecords', () => {
  it('returns records for a pet', async () => {
    mockTerminal.mockResolvedValueOnce({ data: [mockRecord], error: null })

    const result = await getHealthRecords('pet-1')

    expect(result).toEqual([mockRecord])
  })

  it('throws on database error', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Query failed' } })

    await expect(getHealthRecords('pet-1')).rejects.toThrow('Query failed')
  })
})

describe('createHealthRecord', () => {
  it('creates and returns a record', async () => {
    mockTerminal.mockResolvedValueOnce({ data: mockRecord, error: null })

    const result = await createHealthRecord({
      pet_id: 'pet-1',
      type: 'vaccine',
      description: 'Rabies vaccine',
      record_date: '2024-01-15',
    })

    expect(result).toEqual(mockRecord)
  })

  it('throws on database error', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } })

    await expect(
      createHealthRecord({ pet_id: 'pet-1', type: 'vaccine', description: 'Test', record_date: '2024-01-15' })
    ).rejects.toThrow('Insert failed')
  })
})

describe('deleteHealthRecord', () => {
  it('deletes without throwing on success', async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: null })

    await expect(deleteHealthRecord('r1')).resolves.toBeUndefined()
  })

  it('throws on database error', async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: { message: 'Delete failed' } })

    await expect(deleteHealthRecord('r1')).rejects.toThrow('Delete failed')
  })
})
