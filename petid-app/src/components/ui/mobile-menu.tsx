'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { setLocale } from '@/app/actions/set-locale'
import type { Locale } from '@/i18n/config'

interface MobileMenuProps {
  email: string
  signOutAction: () => Promise<void>
}

function LocaleSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchLocale(next: Locale) {
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1 border border-border">
      {(['en', 'es'] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={isPending || locale === l}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
            locale === l
              ? 'bg-primary text-primary-foreground shadow-warm'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
          aria-pressed={locale === l}
        >
          {t(l as 'en' | 'es')}
        </button>
      ))}
    </div>
  )
}

export function MobileMenu({ email, signOutAction }: MobileMenuProps) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border truncate max-w-[200px]">
          {email}
        </span>
        <LocaleSwitcher />
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            {t('signOut')}
          </Button>
        </form>
      </div>

      {/* Mobile: hamburger button */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <>
          <div
            className="sm:hidden fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav"
            role="dialog"
            aria-label="Navigation menu"
            className="sm:hidden absolute top-16 left-0 right-0 z-40 bg-card border-b border-border shadow-warm-md animate-slide-in"
          >
            <div className="px-4 py-5 space-y-4">
              <p className="text-sm text-muted-foreground truncate">{email}</p>
              <LocaleSwitcher />
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  {t('signOut')}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
