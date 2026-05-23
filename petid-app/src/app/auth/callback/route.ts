import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function sanitizeNext(next: string | null): string {
  if (!next) return '/dashboard'
  if (!next.startsWith('/')) return '/dashboard'
  if (next.startsWith('//')) return '/dashboard'
  if (next.includes('://')) return '/dashboard'
  return next
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = sanitizeNext(url.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
