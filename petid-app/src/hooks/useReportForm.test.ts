import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportForm } from './useReportForm'

const { mockInsert } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
    }),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
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
    mockInsert.mockResolvedValueOnce({ error: null })

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
    mockInsert.mockResolvedValueOnce({ error: null })

    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })

    await act(async () => { await result.current.submit() })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ contact: null })
    )
  })

  it('submit sets error on database failure', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'DB error' } })

    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })

    let returned = true
    await act(async () => {
      returned = await result.current.submit()
    })

    expect(returned).toBe(false)
    expect(result.current.error).toBe('DB error')
  })

  it('reset clears form and success state', async () => {
    mockInsert.mockResolvedValueOnce({ error: null })

    const { result } = renderHook(() => useReportForm('pet-1'))
    act(() => { result.current.handleChange('message', 'Found your pet') })
    await act(async () => { await result.current.submit() })

    act(() => { result.current.reset() })

    expect(result.current.formData.message).toBe('')
    expect(result.current.success).toBe(false)
  })
})
