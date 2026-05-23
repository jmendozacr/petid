'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { setLocale } from '@/app/actions/set-locale'
import type { Locale } from '@/i18n/config'

interface MobileMenuProps {
  email: string
  displayName: string
  signOutAction: () => Promise<void>
  settingsHref?: string
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

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function MobileMenu({ email, displayName, signOutAction, settingsHref }: MobileMenuProps) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-2">
      {/* Language switcher — always visible outside the menu */}
      <LocaleSwitcher />

      {/* ── Desktop: profile pill trigger ── */}
      <div className="hidden sm:block relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="desktop-nav"
          className={`
            flex items-center gap-2.5 h-9 pl-1 pr-3 rounded-full border transition-all duration-200 cursor-pointer
            ${open
              ? 'bg-accent border-border shadow-warm'
              : 'bg-card border-border hover:bg-accent hover:shadow-warm'
            }
          `}
        >
          {/* Avatar circle */}
          <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center flex-shrink-0 shadow-warm">
            {initial}
          </span>
          {/* Display name */}
          <span className="text-sm text-foreground font-medium truncate max-w-[140px]">
            {displayName}
          </span>
          <ChevronIcon open={open} />
        </button>

        {/* Desktop dropdown — right-anchored compact card */}
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              id="desktop-nav"
              role="dialog"
              aria-label="Account menu"
              className="absolute top-[calc(100%+8px)] right-0 z-40 w-64 bg-card border border-border rounded-xl shadow-warm-lg animate-scale-in origin-top-right overflow-hidden"
            >
              {/* Email header */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  {initial}
                </span>
                <p className="text-sm text-foreground font-medium truncate">{email}</p>
              </div>

              <div className="h-px bg-border mx-3" />

              {/* Nav items */}
              <div className="py-1.5">
                {settingsHref && (
                  <Link
                    href={settingsHref}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
                  >
                    <SettingsIcon />
                    {t('settings')}
                  </Link>
                )}
              </div>

              <div className="h-px bg-border mx-3" />

              <div className="py-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false)
                    await signOutAction()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/8 transition-colors duration-150 cursor-pointer"
                >
                  <SignOutIcon />
                  {t('signOut')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Mobile: hamburger trigger ── */}
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

        {/* Mobile dropdown — full width */}
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              id="mobile-nav"
              role="dialog"
              aria-label="Navigation menu"
              className="absolute top-16 left-0 right-0 z-40 bg-card border-b border-border shadow-warm-md animate-slide-in"
            >
              <div className="px-4 py-5 space-y-4">
                <p className="text-sm text-muted-foreground truncate">{email}</p>
                {settingsHref && (
                  <Link
                    href={settingsHref}
                    className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                    onClick={() => setOpen(false)}
                  >
                    {t('settings')}
                  </Link>
                )}
                <LocaleSwitcher />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    setOpen(false)
                    await signOutAction()
                  }}
                >
                  {t('signOut')}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
