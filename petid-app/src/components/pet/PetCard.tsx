import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoDisplay } from '@/components/ui/photo-display'
import { Button } from '@/components/ui/button'
import type { Pet } from '@/types/pet'

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted relative">
        <PhotoDisplay photoUrl={pet.photo_url} alt={pet.name} />
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
