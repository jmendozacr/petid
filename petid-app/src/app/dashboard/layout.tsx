import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/error-boundary'

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-warm sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200"
          >
            <PawIcon className="h-6 w-6 text-primary" />
            <span className="font-heading text-lg font-semibold tracking-tight">PetID</span>
          </Link>

          <nav aria-label="Main navigation">
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border truncate max-w-[200px]">
                {user.email}
              </span>
              <form action={handleSignOut}>
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign Out
                </Button>
              </form>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8" role="main">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
}
