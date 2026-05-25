import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

const { mockSignIn, mockSignUp, mockSignOut, mockSignInWithOAuth } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAuth - signIn', () => {
  it('sets error for invalid email', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn('not-an-email', 'password123')
    })

    expect(result.current.error).toBe('Ingresa un email válido')
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('sets error for short password', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn('user@example.com', '123')
    })

    expect(result.current.error).toBe('La contraseña debe tener al menos 6 caracteres')
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('returns user on successful sign in', async () => {
    const mockUser = { id: 'user-1', email: 'user@example.com' }
    mockSignIn.mockResolvedValueOnce({ data: { user: mockUser }, error: null })

    const { result } = renderHook(() => useAuth())

    let returned: { user: typeof mockUser | null } = { user: null }
    await act(async () => {
      returned = await result.current.signIn('user@example.com', 'password123')
    })

    expect(returned.user).toEqual(mockUser)
    expect(result.current.error).toBeNull()
  })

  it('sets error on auth failure', async () => {
    mockSignIn.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Invalid credentials' } })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signIn('user@example.com', 'password123')
    })

    expect(result.current.error).toBe('Invalid credentials')
  })
})

describe('useAuth - signUp', () => {
  it('sets error for invalid email', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signUp({ email: 'bad-email', password: 'password123', fullName: 'John Doe' })
    })

    expect(result.current.error).toBe('Ingresa un email válido')
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('sets error for short password', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signUp({ email: 'user@example.com', password: '12345', fullName: 'John Doe' })
    })

    expect(result.current.error).toBe('La contraseña debe tener al menos 6 caracteres')
  })

  it('returns success on valid sign up', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null })

    const { result } = renderHook(() => useAuth())

    let returned = { success: false }
    await act(async () => {
      returned = await result.current.signUp({ email: 'user@example.com', password: 'password123', fullName: 'John Doe' })
    })

    expect(returned.success).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('passes fullName and phone as metadata options to signUp', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signUp({ email: 'user@example.com', password: 'password123', fullName: 'Jane Doe', phone: '+54911' })
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
      options: { data: { full_name: 'Jane Doe', phone: '+54911' } },
    })
  })
})

describe('useAuth - signInWithGoogle', () => {
  it('loading transitions false → true → false', async () => {
    let resolveOAuth!: (val: unknown) => void
    mockSignInWithOAuth.mockReturnValueOnce(new Promise((res) => { resolveOAuth = res }))

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(false)

    let callPromise: Promise<{ error: null | { message: string } }>
    act(() => {
      callPromise = result.current.signInWithGoogle()
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveOAuth({ data: {}, error: null })
      await callPromise
    })

    expect(result.current.loading).toBe(false)
  })

  it('calls signInWithOAuth with google provider and correct redirectTo', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ data: {}, error: null })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  })

  it('sets error state on failure', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ data: null, error: { message: 'OAuth failed' } })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toBe('OAuth failed')
  })
})

describe('useAuth - clearError', () => {
  it('clears the error state', async () => {
    mockSignIn.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Error' } })

    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.signIn('user@example.com', 'password123') })

    act(() => { result.current.clearError() })

    expect(result.current.error).toBeNull()
  })
})
