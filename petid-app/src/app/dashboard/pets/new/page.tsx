'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePetForm } from '@/hooks/usePetForm'
import { PetFormFields } from '@/components/pet/PetFormFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function NewPetPage() {
  const router = useRouter()
  const { formData, loading, error, handleChange, submit } = usePetForm()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const pet = await submit()
    if (pet) {
      router.push('/dashboard')
    }
  }, [submit, router])

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Pet</CardTitle>
          <CardDescription>Enter your pet&apos;s information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <PetFormFields formData={formData} onChange={handleChange} error={error} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Pet'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
