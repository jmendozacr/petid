'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePets } from '@/hooks/usePets'
import { PetCard } from '@/components/pet/PetCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription } from '@/components/ui/card'

export default function DashboardPage() {
  const { pets, isLoading, error, loadPets } = usePets()

  useEffect(() => {
    loadPets()
  }, [loadPets])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Pets</h1>
        <Button asChild>
          <Link href="/dashboard/pets/new">Add New Pet</Link>
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-danger bg-danger/10">
          <CardContent className="py-4">
            <p className="text-danger text-center">{error}</p>
          </CardContent>
        </Card>
      ) : pets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardDescription className="text-base mb-4">
              You haven&apos;t added any pets yet
            </CardDescription>
            <Button asChild>
              <Link href="/dashboard/pets/new">Add Your First Pet</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}
