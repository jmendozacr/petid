'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('signup')
  const { loading, error, signUp, signInWithGoogle, clearError } = useAuth()

  const [fullName, setFullName] = useState('')
  const [fullNameError, setFullNameError] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (fullName.trim().length < 2) {
      setFullNameError(t('fullNameError'))
      return
    }
    setFullNameError(null)
    const result = await signUp({ email, password, fullName, phone: phone || undefined })
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
          <h1 className="font-heading text-3xl font-semibold text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-1.5">{t('subtitle')}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-warm-md p-8">
          {success ? (
            <div className="space-y-4 text-center">
              <div role="alert" aria-live="polite" className="text-sm text-success p-3 rounded-lg bg-success/10 border border-success/20">
                {t('successMessage')}
              </div>
              <Button asChild className="w-full">
                <Link href="/login">{t('goToLogin')}</Link>
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {error && (
                  <div id="email-error" role="alert" aria-live="assertive" className="text-sm text-danger p-3 rounded-lg bg-danger/10 border border-danger/20">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">{t('fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    aria-required="true"
                    aria-invalid={!!fullNameError}
                    aria-describedby={fullNameError ? 'fullname-error' : undefined}
                    autoComplete="name"
                  />
                  {fullNameError && (
                    <p id="fullname-error" role="alert" className="text-xs text-danger">
                      {fullNameError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t('email')}</Label>
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
                  <Label htmlFor="password">{t('password')}</Label>
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
                  <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? t('submitting') : t('submit')}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t('orContinueWith')}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={signInWithGoogle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('continueWithGoogle')}
              </Button>
            </>
          )}
        </div>

        <p className="text-sm text-center text-muted-foreground mt-6">
          {t('haveAccount')}{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
