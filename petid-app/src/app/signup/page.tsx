'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="50" cy="68" rx="24" ry="20" />
      <ellipse cx="26" cy="47" rx="11" ry="9" transform="rotate(-20 26 47)" />
      <ellipse cx="41" cy="36" rx="11" ry="9" transform="rotate(-5 41 36)" />
      <ellipse cx="59" cy="36" rx="11" ry="9" transform="rotate(5 59 36)" />
      <ellipse cx="74" cy="47" rx="11" ry="9" transform="rotate(20 74 47)" />
    </svg>
  )
}

export default function SignupPage() {
  const { loading, error, signUp, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signUp(email, password)
    if (result.success) {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-6">
            <PawIcon className="h-6 w-6 text-primary" />
            <span className="font-heading text-lg font-semibold tracking-tight">PetID</span>
          </Link>
          <h1 className="font-heading text-3xl font-semibold text-foreground">Create account</h1>
          <p className="text-muted-foreground mt-1.5">Start managing your pets today</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-warm-md p-8">
          {success ? (
            <div className="space-y-4 text-center">
              <div role="alert" aria-live="polite" className="text-sm text-success p-3 rounded-lg bg-success/10 border border-success/20">
                Check your email for the confirmation link!
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Go to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {error && (
                <div id="email-error" role="alert" aria-live="assertive" className="text-sm text-danger p-3 rounded-lg bg-danger/10 border border-danger/20">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby="email-error"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby="password-error"
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">At least 6 characters</p>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
