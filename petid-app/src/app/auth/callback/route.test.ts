import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockExchangeCodeForSession } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    }),
}))

// Import after mocks are set up
import { GET } from './route'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost:3000/auth/callback')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new Request(url.toString())
}

describe('GET /auth/callback', () => {
  it('valid code → calls exchangeCodeForSession and redirects to /dashboard', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })

    const request = makeRequest({ code: 'valid-code' })
    const response = await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-code')
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('missing code → redirects to /login?error=auth without calling exchangeCodeForSession', async () => {
    const request = makeRequest({})
    const response = await GET(request)

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=auth')
  })

  it('valid code + next=/dashboard/pets → redirects to /dashboard/pets', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })

    const request = makeRequest({ code: 'valid-code', next: '/dashboard/pets' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard/pets')
  })

  it('valid code + next=https://evil.com → redirects to /dashboard (open redirect blocked)', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })

    const request = makeRequest({ code: 'valid-code', next: 'https://evil.com' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
  })

  it('auth error from exchangeCodeForSession → redirects to /login?error=auth', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: { message: 'Invalid code' } })

    const request = makeRequest({ code: 'bad-code' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=auth')
  })
})
