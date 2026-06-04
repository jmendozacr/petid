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

  it('renders cancel button in form footer (REQ-01.1)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked (REQ-01.2)', () => {
    const onCancel = vi.fn()
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('associates description label with textarea via htmlFor/id (REQ-02.1)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const textarea = screen.getByLabelText('Description')
    expect(textarea.tagName.toLowerCase()).toBe('textarea')
    expect(textarea).toHaveAttribute('id', 'description')
  })

  it('shows inline error and aria-invalid on empty description submit (REQ-03.1)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.submit(screen.getByRole('button', { name: /save record/i }).closest('form')!)
    const textarea = screen.getByPlaceholderText(/enter details/i)
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getAllByText(/description is required/i).length).toBeGreaterThan(0)
  })

  it('has no aria-invalid on textarea when description is valid (REQ-03.2)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/enter details/i), {
      target: { value: 'Rabies vaccine' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /save record/i }).closest('form')!)
    const textarea = screen.getByPlaceholderText(/enter details/i)
    expect(textarea).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('moves focus to description textarea after failed submit (REQ-04.1)', () => {
    render(<HealthRecordForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.submit(screen.getByRole('button', { name: /save record/i }).closest('form')!)
    const textarea = screen.getByPlaceholderText(/enter details/i)
    expect(document.activeElement).toBe(textarea)
  })
})
