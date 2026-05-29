import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { HealthRecordForm } from './HealthRecordForm'

describe('HealthRecordForm', () => {
  it('shows next_due_date field when type is vaccine (REQ-01.1)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    // Default type is vaccine
    expect(screen.getByLabelText(/next due date/i)).toBeInTheDocument()
  })

  it('hides next_due_date field when type changes to allergy (REQ-01.2)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const typeSelect = screen.getByRole('combobox')
    fireEvent.change(typeSelect, { target: { value: 'allergy' } })
    expect(screen.queryByLabelText(/next due date/i)).not.toBeInTheDocument()
  })

  it('hides next_due_date field when type is medical_note (REQ-01.2)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const typeSelect = screen.getByRole('combobox')
    fireEvent.change(typeSelect, { target: { value: 'medical_note' } })
    expect(screen.queryByLabelText(/next due date/i)).not.toBeInTheDocument()
  })

  it('submits with null next_due_date when field left empty (REQ-01.3)', async () => {
    const onSubmit = vi.fn()
    render(<HealthRecordForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText(/enter details/i), {
      target: { value: 'Rabies vaccine' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /save record/i }).closest('form')!)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'vaccine', next_due_date: null }),
    )
  })

  it('submits with next_due_date value when filled', () => {
    const onSubmit = vi.fn()
    render(<HealthRecordForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText(/enter details/i), {
      target: { value: 'Rabies vaccine' },
    })
    fireEvent.change(screen.getByLabelText(/next due date/i), {
      target: { value: '2025-06-01' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /save record/i }).closest('form')!)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ next_due_date: '2025-06-01' }),
    )
  })
})
