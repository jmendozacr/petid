import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Pet } from '@/types/pet'

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted relative">
        {pet.photo_url ? (
          <img 
            src={pet.photo_url} 
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-muted-foreground"
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
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{pet.name}</CardTitle>
        <CardDescription>
          {pet.species && `${pet.species}`}
          {pet.breed && ` - ${pet.breed}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/dashboard/pets/${pet.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
