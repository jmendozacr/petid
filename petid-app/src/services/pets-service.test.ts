import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPets, getPetById, createPet, updatePet, deletePet, uploadPetPhoto } from './pets-service'
import type { Pet } from '@/types/pet'

const { mockTerminal, mockDeleteEq, mockGetUser, mockStorageUpload, mockGetPublicUrl } = vi.hoisted(() => ({
  mockTerminal: vi.fn(),
  mockDeleteEq: vi.fn(),
  mockGetUser: vi.fn(),
  mockStorageUpload: vi.fn(),
  mockGetPublicUrl: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const c: Record<string, unknown> = {}
    c.select = () => c
    c.eq = () => c
    c.order = mockTerminal
    c.single = mockTerminal
    c.insert = () => c
    c.update = () => c
    c.delete = () => ({ eq: mockDeleteEq })
    return {
      auth: { getUser: mockGetUser },
      from: () => c,
      storage: {
        from: () => ({
          upload: mockStorageUpload,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    }
  },
}))

const mockPet: Pet = {
  id: '1',
  user_id: 'user-1',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  birthdate: '2020-01-15',
  color: 'Golden',
  weight: 30,
  microchip_id: 'ABC123',
  photo_url: null,
  owner_phone: '+1234567890',
  emergency_contact: '+0987654321',
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
})

describe('getPets', () => {
  it('returns pets when user is logged in', async () => {
    mockTerminal.mockResolvedValueOnce({ data: [mockPet], error: null })

    const result = await getPets()

    expect(result).toEqual([mockPet])
  })

  it('throws when user is not logged in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    await expect(getPets()).rejects.toThrow('You must be logged in')
  })

  it('throws on database error', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    await expect(getPets()).rejects.toThrow('DB error')
  })
})

describe('getPetById', () => {
  it('returns pet when found', async () => {
    mockTerminal.mockResolvedValueOnce({ data: mockPet, error: null })

    const result = await getPetById('1')

    expect(result).toEqual(mockPet)
  })

  it('returns null on error', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

    const result = await getPetById('999')

    expect(result).toBeNull()
  })
})

describe('createPet', () => {
  it('creates and returns pet', async () => {
    mockTerminal.mockResolvedValueOnce({ data: mockPet, error: null })

    const result = await createPet({ name: 'Buddy' })

    expect(result).toEqual(mockPet)
  })

  it('throws when user is not logged in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    await expect(createPet({ name: 'Buddy' })).rejects.toThrow('You must be logged in')
  })

  it('throws on database error', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } })

    await expect(createPet({ name: 'Buddy' })).rejects.toThrow('Insert failed')
  })
})

describe('updatePet', () => {
  it('updates and returns pet', async () => {
    const updated = { ...mockPet, name: 'Buddy Jr.' }
    mockTerminal.mockResolvedValueOnce({ data: updated, error: null })

    const result = await updatePet('1', { name: 'Buddy Jr.' })

    expect(result.name).toBe('Buddy Jr.')
  })

  it('throws on database error', async () => {
    mockTerminal.mockResolvedValueOnce({ data: null, error: { message: 'Update failed' } })

    await expect(updatePet('1', { name: 'X' })).rejects.toThrow('Update failed')
  })
})

describe('deletePet', () => {
  it('deletes without throwing on success', async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: null })

    await expect(deletePet('1')).resolves.toBeUndefined()
  })

  it('throws on database error', async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: { message: 'Delete failed' } })

    await expect(deletePet('1')).rejects.toThrow('Delete failed')
  })
})

describe('uploadPetPhoto', () => {
  it('uploads file and returns public URL', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: null })
    mockGetPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'https://example.com/photo.jpg' } })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await uploadPetPhoto('pet-1', file)

    expect(result).toBe('https://example.com/photo.jpg')
  })

  it('throws on upload error', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: { message: 'Upload failed' } })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(uploadPetPhoto('pet-1', file)).rejects.toThrow('Upload failed')
  })
})
