'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface MobileMenuProps {
  email: string
  signOutAction: () => Promise<void>
}

export function MobileMenu({ email, signOutAction }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border truncate max-w-[200px]">
          {email}
        </span>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Sign Out
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
          {/* Backdrop — closes on tap outside */}
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
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
