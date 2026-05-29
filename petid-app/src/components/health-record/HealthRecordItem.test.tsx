import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { HealthRecordItem } from './HealthRecordItem'
import type { HealthRecord } from '@/types/health-record'

const baseRecord: HealthRecord = {
  id: 'r1',
  pet_id: 'pet-1',
  type: 'vaccine',
  description: 'Rabies',
  record_date: '2024-01-15',
  next_due_date: null,
  reminder_sent_at: null,
  created_at: '2024-01-15T00:00:00Z',
}

describe('HealthRecordItem', () => {
  it('renders description and date', () => {
    render(<HealthRecordItem record={baseRecord} onDelete={vi.fn()} />)
    expect(screen.getByText('Rabies')).toBeInTheDocument()
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })

  it('shows next_due_date badge when set (REQ-02.1)', () => {
    const record = { ...baseRecord, next_due_date: '2025-01-15' }
    render(<HealthRecordItem record={record} onDelete={vi.fn()} />)
    expect(screen.getByText(/2025-01-15/)).toBeInTheDocument()
  })

  it('hides next_due_date badge when null (REQ-02.2)', () => {
    render(<HealthRecordItem record={baseRecord} onDelete={vi.fn()} />)
    expect(screen.queryByText(/Next due/i)).not.toBeInTheDocument()
  })

  it('renders without error when next_due_date is undefined (REQ-03.1)', () => {
    const record = { ...baseRecord }
    delete (record as Partial<HealthRecord>).next_due_date
    render(<HealthRecordItem record={record as HealthRecord} onDelete={vi.fn()} />)
    expect(screen.getByText('Rabies')).toBeInTheDocument()
  })
})
