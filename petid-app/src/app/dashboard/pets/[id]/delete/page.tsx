'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPetById, deletePet } from '@/services/pets-service'

export default function DeletePetPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.id as string

  const [petName, setPetName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPet() {
      try {
        const pet = await getPetById(petId)
        if (pet) {
          setPetName(pet.name)
        } else {
          setError('Pet not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pet')
      } finally {
        setLoading(false)
      }
    }
    loadPet()
  }, [petId])

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    setError(null)
    try {
      await deletePet(petId)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pet')
      setDeleting(false)
    }
  }, [petId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error && !petName) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card className="border-danger">
          <CardContent className="py-6 text-center">
            <p className="text-danger">{error}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Delete Pet</CardTitle>
          <CardDescription>
            Are you sure you want to delete {petName}? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div role="alert" className="text-sm text-danger p-3 rounded-md bg-danger/10">
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              disabled={deleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
