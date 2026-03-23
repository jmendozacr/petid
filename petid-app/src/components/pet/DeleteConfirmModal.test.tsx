import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteConfirmModal } from './DeleteConfirmModal'

const defaultProps = {
  isOpen: true,
  title: 'Delete Pet',
  itemName: 'Buddy',
  loading: false,
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
}

describe('DeleteConfirmModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Delete Pet')).toBeNull()
  })

  it('renders title and item name when open', () => {
    render(<DeleteConfirmModal {...defaultProps} />)

    expect(screen.getByText('Delete Pet')).toBeInTheDocument()
    expect(screen.getByText(/Buddy/)).toBeInTheDocument()
  })

  it('calls onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables buttons and shows Deleting... when loading', () => {
    render(<DeleteConfirmModal {...defaultProps} loading={true} />)

    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })
})
