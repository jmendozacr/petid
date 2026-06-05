import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportForm } from './useReportForm'

const { mockInsert, mockSingle, mockUpdateEq, mockUploadReportPhoto } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockSingle: vi.fn(),
  mockUpdateEq: vi.fn(),
  mockUploadReportPhoto: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
      update: () => ({ eq: mockUpdateEq }),
    }),
  }),
}))

vi.mock('@/services/pets-service', () => ({
  uploadReportPhoto: mockUploadReportPhoto,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })
  mockSingle.mockResolvedValue({ data: { id: 'report-1' }, error: null })
  mockUpdateEq.mockResolvedValue({ error: null })
  mockUploadReportPhoto.mockResolvedValue('https://example.com/photo.jpg')
})

describe('useReportForm', () => {
  it('initializes with empty form data', () => {
    const { result } = renderHook(() => useReportForm('pet-1'))

    expect(result.current.formData.message).toBe('')
    expect(result.current.formData.location).toBe('')
    expect(result.current.formData.contact).toBe('')
    expect(result.current.success).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handleChange updates the correct field', () => {
    const { result } = renderHook(() => useReportForm('pet-1'))

    act(() => {
      result.current.handleChange('message', 'Found your pet near the park')
    })

    expect(result.current.formData.message).toBe('Found your pet near the park')
  })

  it('submit with empty message sets error and returns false', async () => {
    const { result } = renderHook(() => useReportForm('pet-1'))

    let returned = true
    await act(async () => {
      returned = await result.current.submit()
    })

    expect(returned).toBe(false)
    expect(result.current.error).toBe('El mensaje es requerido')
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('submit with valid message sends report and sets success', async () => {
    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your dog near Central Park') })
    act(() => { result.current.handleChange('location', 'Central Park') })
    act(() => { result.current.handleChange('contact', '555-1234') })

    let returned = false
    await act(async () => {
      returned = await result.current.submit()
    })

    expect(returned).toBe(true)
    expect(result.current.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        pet_id: 'pet-1',
        message: 'Found your dog near Central Park',
        location: 'Central Park',
        contact: '555-1234',
      })
    )
  })

  it('contact is sent as null when empty', async () => {
    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })

    await act(async () => { await result.current.submit() })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact: null })
    )
  })

  it('submit sets error on database failure', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })

    let returned = true
    await act(async () => {
      returned = await result.current.submit()
    })

    expect(returned).toBe(false)
    expect(result.current.error).toBe('DB error')
  })

  it('uploads photo when provided and updates report', async () => {
    const { result } = renderHook(() => useReportForm('pet-1'))
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

    act(() => { result.current.handleChange('message', 'Found near the park') })
    act(() => { result.current.handlePhotoChange(file) })

    await act(async () => { await result.current.submit() })

    expect(mockUploadReportPhoto).toHaveBeenCalledWith('report-1', file)
    expect(mockUpdateEq).toHaveBeenCalled()
  })

  it('skips photo upload when no photo provided', async () => {
    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found near the park') })

    await act(async () => { await result.current.submit() })

    expect(mockUploadReportPhoto).not.toHaveBeenCalled()
  })

  it('sets fallback error when insert returns null report with no error (line 56 ?? branch)', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null })

    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })

    let returned = true
    await act(async () => { returned = await result.current.submit() })

    expect(returned).toBe(false)
    expect(result.current.error).toBe('Failed to submit report')
  })

  it('sets error.message in catch when Supabase throws an Error (line 71 true branch)', async () => {
    mockSingle.mockRejectedValueOnce(new Error('Network failure'))

    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })

    let returned = true
    await act(async () => { returned = await result.current.submit() })

    expect(returned).toBe(false)
    expect(result.current.error).toBe('Network failure')
  })

  it('sets fallback error message when thrown value is not an Error', async () => {
    mockSingle.mockRejectedValue('plain string error')

    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })

    let returned = true
    await act(async () => { returned = await result.current.submit() })

    expect(returned).toBe(false)
    expect(result.current.error).toBe('Failed to submit report')
  })

  it('reset clears form and success state', async () => {
    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })
    await act(async () => { await result.current.submit() })

    act(() => { result.current.reset() })

    expect(result.current.formData.message).toBe('')
    expect(result.current.success).toBe(false)
  })
})
