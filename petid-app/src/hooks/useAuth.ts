import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/services/profile-service'
import type { User } from '@supabase/supabase-js'

function validateAuthFields(email: string, password: string): string | null {
  if (!email.trim() || !email.includes('@')) return 'Ingresa un email válido'
  if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
  return null
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const signIn = useCallback(async (email: string, password: string): Promise<{ user: User | null }> => {
    const validationError = validateAuthFields(email, password)
    if (validationError) {
      setError(validationError)
      return { user: null }
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return { user: null }
      }

      return { user: data.user }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      return { user: null }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const signUp = useCallback(async ({
    email,
    password,
    fullName,
    phone,
  }: {
    email: string
    password: string
    fullName: string
    phone?: string
  }): Promise<{ success: boolean }> => {
    const validationError = validateAuthFields(email, password)
    if (validationError) {
      setError(validationError)
      return { success: false }
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return { success: false }
      }

      if (data?.user) {
        await updateProfile(data.user.id, {
          full_name: fullName,
          phone: phone || null,
        })
      }

      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const signInWithGoogle = useCallback(async (): Promise<{ error: { message: string } | null }> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
        return { error: authError }
      }

      return { error: data?.error ?? null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed'
      setError(message)
      return { error: { message } }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  }
}
