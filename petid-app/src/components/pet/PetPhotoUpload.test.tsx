import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { PetPhotoUpload } from './PetPhotoUpload'

describe('PetPhotoUpload', () => {
  it('renders always-visible upload affordance regardless of pointer device (REQ-01.1)', () => {
    render(<PetPhotoUpload photoUrl={null} uploading={false} onPhotoChange={vi.fn()} alt="Buddy" />)
    expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument()
  })

  it('clicking upload button triggers the file input (REQ-01.2)', () => {
    render(<PetPhotoUpload photoUrl={null} uploading={false} onPhotoChange={vi.fn()} alt="Buddy" />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(fileInput, 'click')

    fireEvent.click(screen.getByRole('button', { name: /upload photo/i }))

    expect(clickSpy).toHaveBeenCalled()
  })

  it('calls onPhotoChange with selected file on input change (REQ-01.2)', () => {
    const onPhotoChange = vi.fn()
    render(<PetPhotoUpload photoUrl={null} uploading={false} onPhotoChange={onPhotoChange} alt="Buddy" />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(onPhotoChange).toHaveBeenCalledWith(file)
  })
})
