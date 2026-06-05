import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders message text (REQ-01.1)', () => {
    render(<EmptyState message="No pets found" />)
    expect(screen.getByText('No pets found')).toBeInTheDocument()
  })

  it('renders icon container when icon prop is provided (REQ-01.2)', () => {
    render(<EmptyState message="Empty" icon={<svg data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders action element when action prop is provided (REQ-01.3)', () => {
    render(<EmptyState message="Empty" action={<button>Add pet</button>} />)
    expect(screen.getByRole('button', { name: 'Add pet' })).toBeInTheDocument()
  })

  it('renders without icon or action when only message given', () => {
    const { container } = render(<EmptyState message="Nothing here" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})
