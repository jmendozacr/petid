'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePet } from '@/hooks/usePet'
import { DeleteConfirmModal } from '@/components/pet/DeleteConfirmModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DeletePetPage() {
  const router = useRouter()
  const { pet, loading, error, remove } = usePet('')
  const [deleting, setDeleting] = useState(false)

  const petId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('petId') || ''
    : ''

  useEffect(() => {
    if (!petId && !loading) {
      router.push('/dashboard')
    }
  }, [petId, loading, router])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await remove()
      router.push('/dashboard')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete pet')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card className="border-danger">
          <CardContent className="py-6 text-center">
            <p className="text-danger">{error || 'Pet not found'}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DeleteConfirmModal
      isOpen={true}
      title="Delete Pet"
      itemName={pet.name}
      loading={deleting}
      onCancel={() => router.back()}
      onConfirm={handleDelete}
    />
  )
}
