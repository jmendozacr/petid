import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom, mockGetUserById, mockFetch } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUserById: vi.fn(),
  mockFetch: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { admin: { getUserById: mockGetUserById } },
  }),
}))

vi.stubGlobal('fetch', mockFetch)
vi.stubEnv('CRON_SECRET', 'test-secret')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://supabase.test')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key')
vi.stubEnv('RESEND_API_KEY', 'resend-key')

import { GET } from './route'

function makeRequest(authHeader?: string) {
  const headers = new Headers()
  if (authHeader !== undefined) headers.set('authorization', authHeader)
  return new Request('http://localhost:3000/api/cron/vaccine-reminders', { headers })
}

function makeSelectChain(data: unknown[]) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    is: vi.fn().mockResolvedValue({ data, error: null }),
  }
  chain.select.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.gte.mockReturnValue(chain)
  chain.lte.mockReturnValue(chain)
  return chain
}

function makeUpdateChain(error: unknown = null) {
  const chain = {
    update: vi.fn(),
    eq: vi.fn().mockResolvedValue({ error }),
  }
  chain.update.mockReturnValue(chain)
  return chain
}

const dueVaccine = {
  id: 'r1',
  description: 'Rabies',
  next_due_date: '2026-12-01',
  pet: { id: 'p1', name: 'Fido', user_id: 'u1' },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFrom.mockReturnValue(makeSelectChain([]))
})

describe('GET /api/cron/vaccine-reminders', () => {
  describe('authentication (REQ-01)', () => {
    it('missing Authorization header → 401', async () => {
      const response = await GET(makeRequest())
      expect(response.status).toBe(401)
    })

    it('wrong CRON_SECRET → 401', async () => {
      const response = await GET(makeRequest('Bearer wrong-secret'))
      expect(response.status).toBe(401)
    })

    it('valid CRON_SECRET → 200', async () => {
      const response = await GET(makeRequest('Bearer test-secret'))
      expect(response.status).toBe(200)
    })
  })

  describe('no vaccines due', () => {
    it('returns sent:0, skipped:0 (REQ-02)', async () => {
      const response = await GET(makeRequest('Bearer test-secret'))
      expect(await response.json()).toEqual({ sent: 0, skipped: 0 })
    })
  })

  describe('vaccine due in 7 days (REQ-02.1)', () => {
    beforeEach(() => {
      mockFrom
        .mockReturnValueOnce(makeSelectChain([dueVaccine]))
        .mockReturnValue(makeUpdateChain())
      mockGetUserById.mockResolvedValue({
        data: { user: { email: 'owner@test.com' } },
        error: null,
      })
      mockFetch.mockResolvedValue(new Response('{}', { status: 200 }))
    })

    it('sends one email and returns sent:1', async () => {
      const response = await GET(makeRequest('Bearer test-secret'))
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ sent: 1, skipped: 0 })
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    it('calls Resend with correct recipient email', async () => {
      await GET(makeRequest('Bearer test-secret'))
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('https://api.resend.com/emails')
      const body = JSON.parse(init.body as string)
      expect(body.to).toBe('owner@test.com')
    })

    it('email body contains pet name, description, and date (REQ-04.1)', async () => {
      await GET(makeRequest('Bearer test-secret'))
      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
      expect(body.html).toContain('Fido')
      expect(body.html).toContain('Rabies')
      expect(body.html).toContain('2026-12-01')
    })

    it('updates reminder_sent_at after successful send (REQ-03.2)', async () => {
      await GET(makeRequest('Bearer test-secret'))
      // from() called twice: once for select, once for update
      expect(mockFrom).toHaveBeenCalledTimes(2)
      const updateChainMock = mockFrom.mock.results[1].value as ReturnType<typeof makeUpdateChain>
      expect(updateChainMock.update).toHaveBeenCalledWith(
        expect.objectContaining({ reminder_sent_at: expect.any(String) }),
      )
    })
  })

  describe('query window and dedup rules (REQ-02.2, REQ-02.3, REQ-03.1)', () => {
    it('queries with today as lower bound and today+7 as upper bound', async () => {
      const selectChain = makeSelectChain([])
      mockFrom.mockReturnValueOnce(selectChain)

      await GET(makeRequest('Bearer test-secret'))

      const today = new Date().toISOString().split('T')[0]
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() + 7)
      const cutoff = cutoffDate.toISOString().split('T')[0]

      expect(selectChain.gte).toHaveBeenCalledWith('next_due_date', today)
      expect(selectChain.lte).toHaveBeenCalledWith('next_due_date', cutoff)
    })

    it('excludes records where reminder_sent_at is not null (REQ-03.1)', async () => {
      const selectChain = makeSelectChain([])
      mockFrom.mockReturnValueOnce(selectChain)

      await GET(makeRequest('Bearer test-secret'))

      expect(selectChain.is).toHaveBeenCalledWith('reminder_sent_at', null)
    })

    it('sends no email when query returns empty (simulates outside-window/already-reminded)', async () => {
      // Mock returns empty array — represents vaccines due in 8d, past-due, or already reminded
      mockFrom.mockReturnValueOnce(makeSelectChain([]))

      const response = await GET(makeRequest('Bearer test-secret'))

      expect(await response.json()).toEqual({ sent: 0, skipped: 0 })
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Resend fails', () => {
    it('counts as skipped, does not update reminder_sent_at', async () => {
      mockFrom
        .mockReturnValueOnce(makeSelectChain([dueVaccine]))
        .mockReturnValue(makeUpdateChain())
      mockGetUserById.mockResolvedValue({
        data: { user: { email: 'owner@test.com' } },
        error: null,
      })
      mockFetch.mockResolvedValue(new Response('error', { status: 500 }))

      const response = await GET(makeRequest('Bearer test-secret'))
      expect(await response.json()).toEqual({ sent: 0, skipped: 1 })
      expect(mockFrom).toHaveBeenCalledTimes(1) // only select, no update
    })
  })
})
